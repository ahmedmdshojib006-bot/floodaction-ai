import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import WarRoomPage from './pages/WarRoomPage';
import AiLabPage from './pages/AiLabPage';
import LogisticsPage from './pages/LogisticsPage';
import AuditPage from './pages/AuditPage';
import CrisisTriagePage from './pages/CrisisTriagePage';
import { useLiveUpdates } from './hooks/useLiveUpdates';

import { 
  INITIAL_BOATS, 
  INITIAL_SHELTERS, 
  BASE_STATION, 
  INITIAL_VILLAGES, 
  INITIAL_RIVER_CHANNELS 
} from './constants/initialData';
import { rankVillagesByUrgency } from './utils/urgencyEngine';
import { getCoordinatesAlongPath } from './utils/routingEngine';
import { runConstrainedDispatchOptimization } from './utils/cvrpOptimizer';
import { sounds } from './utils/soundEffects';

export default function App() {
  // Navigation State: 'crisis-triage' | 'war-room' | 'ai-lab' | 'logistics' | 'audit'
  const [activePage, setActivePage] = useState('crisis-triage');

  // --- LIVE BACKEND WEBSOCKET & SOS STATE ---
  const {
    sosReports,
    floodZones,
    stats,
    connectionStatus,
    activeToast,
    submitSOS,
    updateStatus,
    simulateTelegramSOS,
    refreshAll
  } = useLiveUpdates();

  // --- CORE FLEET & DISASTER STATE ---
  const [boats, setBoats] = useState(INITIAL_BOATS);
  const [shelters, setShelters] = useState(INITIAL_SHELTERS);
  const [villages, setVillages] = useState(INITIAL_VILLAGES);
  const [channels, setChannels] = useState(INITIAL_RIVER_CHANNELS);
  const [surgeMultiplier, setSurgeMultiplier] = useState(1.0);

  // Tabs & Selection in War Room
  const [activeTab, setActiveTab] = useState('queue'); // 'queue' | 'schedule' | 'logs'
  const [selectedNodeId, setSelectedNodeId] = useState(null);

  // Optimization & Dispatch State
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimizationResult, setOptimizationResult] = useState(null);
  const [isApproved, setIsApproved] = useState(false);

  // UI Modals & Drawers
  const [isScenarioOpen, setIsScenarioOpen] = useState(false);
  const [isOverrideOpen, setIsOverrideOpen] = useState(false);
  const [blockedAlert, setBlockedAlert] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDemoRunning, setIsDemoRunning] = useState(false);

  // Telemetry & Logs
  const [logs, setLogs] = useState([
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      text: 'FloodAction Tactical Command Online. Monitoring Delta Sector-07 for AI Builder Congress 2026.'
    },
    {
      id: 'log-2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      text: 'Monsoon Alert Level 4 active. 5 marooned villages identified. CVRP engine initialized.'
    }
  ]);

  const addLog = useCallback((text, type = 'info') => {
    setLogs(prev => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        type,
        text
      }
    ]);
  }, []);

  // Nodes lookup map
  const nodesMap = useMemo(() => {
    const map = {
      [BASE_STATION.id]: BASE_STATION
    };
    shelters.forEach(s => { map[s.id] = s; });
    villages.forEach(v => { map[v.id] = v; });
    return map;
  }, [shelters, villages]);

  // Dynamically calculate urgency scores
  const rankedVillages = useMemo(() => {
    return rankVillagesByUrgency(villages, surgeMultiplier);
  }, [villages, surgeMultiplier]);

  // --- CVRP OPTIMIZATION TRIGGER ---
  const handleRunOptimization = useCallback(() => {
    setIsOptimizing(true);
    addLog('Executing Multi-Criteria Constrained Dispatch Optimization (CVRP)...', 'info');

    // If previous simulation filled up shelters (50/50 beds) or finished, reset to fresh baseline
    const freeShelterBeds = shelters.reduce((acc, s) => acc + Math.max(0, s.maxCap - s.currentOccupancy), 0);
    const maroonedLeft = villages.reduce((acc, v) => acc + v.remainingPop, 0);

    let baseVillages = rankedVillages;
    let baseShelters = shelters;

    if (freeShelterBeds === 0 || maroonedLeft <= 15) {
      setVillages(INITIAL_VILLAGES);
      setShelters(INITIAL_SHELTERS);
      setBoats(INITIAL_BOATS);
      setIsSimulating(false);
      simulationRef.current = { stepIndex: 0, progress: 0, completedLegs: new Set() };
      setBoatPositions({
        'boat-1': { x: BASE_STATION.x, y: BASE_STATION.y, heading: 0, status: 'At Base', currentLoad: 0 },
        'boat-2': { x: BASE_STATION.x, y: BASE_STATION.y, heading: 0, status: 'At Base', currentLoad: 0 }
      });
      baseVillages = rankVillagesByUrgency(INITIAL_VILLAGES, surgeMultiplier);
      baseShelters = INITIAL_SHELTERS;
      addLog('Re-initializing baseline assets & shelter headroom for fresh dispatch planning.', 'info');
    }

    setTimeout(() => {
      const result = runConstrainedDispatchOptimization({
        villages: baseVillages,
        boats: INITIAL_BOATS,
        shelters: baseShelters,
        channels,
        nodesMap,
        surgeMultiplier
      });

      setOptimizationResult(result);
      setIsOptimizing(false);
      setIsApproved(false);

      result.logs.forEach(l => addLog(l, 'info'));
      addLog(`Optimization resolved: ${result.missions.length} mission legs generated.`, 'success');
    }, 450);
  }, [rankedVillages, boats, shelters, villages, channels, nodesMap, surgeMultiplier, addLog]);

  // Run initial optimization once
  useEffect(() => {
    handleRunOptimization();
  }, []);

  // --- DYNAMIC REROUTING ENGINE (<500ms) ---
  const rerouteTimeoutRef = useRef(null);

  const handleToggleChannelBlockage = useCallback((channelId) => {
    setChannels(prev => {
      const updated = prev.map(ch => {
        if (ch.id === channelId) {
          return { ...ch, isBlocked: !ch.isBlocked };
        }
        return ch;
      });

      const toggled = updated.find(c => c.id === channelId);
      const isNowBlocked = toggled.isBlocked;

      if (isNowBlocked) {
        sounds.playWarning();
        setBlockedAlert(`OBSTRUCTION DETECTED: Channel [${channelId}] is BLOCKED!`);
        addLog(`RIVER HAZARD: Channel ${channelId} (${toggled.name}) blocked by surge debris.`, 'block');
      } else {
        sounds.playClick();
        setBlockedAlert(`CHANNEL RESTORED: [${channelId}] is now NAVIGABLE.`);
        addLog(`NAVIGATION RESTORED: Channel ${channelId} cleared of obstructions.`, 'info');
      }

      setTimeout(() => setBlockedAlert(null), 4500);

      // Debounced recalculation within 380ms (< 500ms guaranteed)
      if (rerouteTimeoutRef.current) clearTimeout(rerouteTimeoutRef.current);
      rerouteTimeoutRef.current = setTimeout(() => {
        addLog('Dynamic Rerouting Engine engaged: Re-evaluating optimal waterways...', 'reroute');
        const result = runConstrainedDispatchOptimization({
          villages: rankedVillages,
          boats,
          shelters,
          channels: updated,
          nodesMap,
          surgeMultiplier
        });
        setOptimizationResult(result);
        addLog(`Dynamic Rerouting Complete: Recalculated ${result.missions.length} viable legs.`, 'success');
      }, 380);

      return updated;
    });
  }, [rankedVillages, boats, shelters, nodesMap, surgeMultiplier, addLog]);

  // --- MISSION SIMULATION & LIVE PLAYBACK ---
  const [isSimulating, setIsSimulating] = useState(false);
  const [boatPositions, setBoatPositions] = useState(() => ({
    'boat-1': { x: BASE_STATION.x, y: BASE_STATION.y, heading: 0, status: 'At Base', currentLoad: 0 },
    'boat-2': { x: BASE_STATION.x, y: BASE_STATION.y, heading: 0, status: 'At Base', currentLoad: 0 }
  }));

  const simulationRef = useRef({
    stepIndex: 0,
    progress: 0,
    completedLegs: new Set()
  });

  const handleToggleSimulation = () => {
    if (!optimizationResult || !optimizationResult.missions || optimizationResult.missions.length === 0) {
      handleRunOptimization();
      return;
    }
    setIsSimulating(prev => !prev);
    if (!isSimulating) {
      addLog('Live Mission Playback commenced: Vessels navigating along scheduled routes.', 'info');
    } else {
      addLog('Mission Playback paused by Commander.', 'info');
    }
  };

  // --- AUTOMATED TELEGRAM BRIDGE/HAZARD DETECTION FOR TACTICAL WAR ROOM ---
  const processedHazardSosIdsRef = useRef(new Set());

  useEffect(() => {
    if (!sosReports || sosReports.length === 0) return;

    sosReports.forEach(report => {
      if (!report || !report.id || processedHazardSosIdsRef.current.has(report.id)) return;
      processedHazardSosIdsRef.current.add(report.id);

      const msg = (report.raw_message || '').toLowerCase();
      let needs = [];
      try {
        needs = typeof report.critical_needs === 'string' 
          ? JSON.parse(report.critical_needs) 
          : (report.critical_needs || []);
      } catch (e) {
        needs = [];
      }

      const hasHazardKeyword = [
        'bridge', 'ব্রিজ', 'ভেঙে', 'ভেঙ্গে', 'ভাঙা', 'ভাঙ্গে', 'venge', 'bhenge', 'bhanga',
        'collapse', 'collapsed', 'block', 'blocked', 'সাঁকো', 'কালভার্ট', 'debris', 'আটকে'
      ].some(k => msg.includes(k)) || needs.includes('bridge_collapse');

      if (!hasHazardKeyword) return;

      // Identify affected channel and node in Tactical River Delta
      let targetChannelId = null;
      let targetName = '';

      if (msg.includes('fulgazi') || msg.includes('fulgachi') || msg.includes('fulgaji') || msg.includes('ফুলগাজী') || msg.includes('ফুলগাজি') || report.location?.toLowerCase().includes('fulgazi')) {
        targetChannelId = 'V3-S1'; // Fulgazi-Feni North Levee Feeder
        targetName = 'Fulgazi (V3) Bridge Channel';
      } else if (msg.includes('parshuram') || msg.includes('পরশুরাম') || report.location?.toLowerCase().includes('parshuram')) {
        targetChannelId = 'V1-S1'; // Parshuram-Feni Levee Canal
        targetName = 'Parshuram (V1) Bridge Channel';
      } else if (msg.includes('gowainghat') || msg.includes('গোয়াইনঘাট') || report.location?.toLowerCase().includes('gowainghat')) {
        targetChannelId = 'BASE-V4';
        targetName = 'Gowainghat (V4) Main Waterway';
      } else if (msg.includes('companiganj') || msg.includes('কোম্পানীগঞ্জ') || report.location?.toLowerCase().includes('companiganj')) {
        targetChannelId = 'BASE-V2';
        targetName = 'Companiganj (V2) Channel';
      } else if (msg.includes('chhagalnaiya') || msg.includes('ছাগলনাইয়া') || report.location?.toLowerCase().includes('chhagalnaiya')) {
        targetChannelId = 'V4-V5';
        targetName = 'Chhagalnaiya (V5) Waterway';
      }

      if (targetChannelId) {
        setChannels(prev => {
          const channelObj = prev.find(c => c.id === targetChannelId);
          if (!channelObj || channelObj.isBlocked) return prev;

          const updated = prev.map(ch => ch.id === targetChannelId ? { ...ch, isBlocked: true } : ch);
          sounds.playWarning();
          setBlockedAlert(`🚨 TELEGRAM INTEL: ${targetName} is COLLAPSED/BLOCKED! Auto-blocked in Tactical War Room.`);
          addLog(`🚨 TELEGRAM CITIZEN INTEL: Bridge/Road collapsed at ${report.location} (${targetChannelId} closed). Initiating dynamic fleet reroute...`, 'block');

          // Dynamic Rerouting of rescue boats
          setTimeout(() => {
            const result = runConstrainedDispatchOptimization({
              villages: rankedVillages,
              boats,
              shelters,
              channels: updated,
              nodesMap,
              surgeMultiplier
            });
            setOptimizationResult(result);
            addLog(`Dynamic Rerouting Complete: Fleets rerouted away from collapsed bridge at ${report.location}.`, 'success');
          }, 350);

          return updated;
        });
      }
    });
  }, [sosReports, rankedVillages, boats, shelters, nodesMap, surgeMultiplier, addLog]);

  // Main simulation animation loop
  useEffect(() => {
    if (!isSimulating || !optimizationResult || !optimizationResult.missions.length) return;

    let animationFrameId;
    let lastTimestamp = performance.now();

    const tick = (now) => {
      const deltaSec = (now - lastTimestamp) / 1000;
      lastTimestamp = now;

      const missions = optimizationResult.missions;
      const sim = simulationRef.current;

      const speedScale = 0.28;
      sim.progress += deltaSec * speedScale;

      const currentMissionIndex = Math.min(missions.length - 1, Math.floor(sim.progress));
      const legProgress = sim.progress - Math.floor(sim.progress);
      const activeLeg = missions[currentMissionIndex];

      if (activeLeg) {
        const boatId = activeLeg.boatId;
        const coords = getCoordinatesAlongPath(activeLeg.combinedPath, nodesMap, legProgress);

        setBoatPositions(prev => ({
          ...prev,
          [boatId]: {
            x: coords.x,
            y: coords.y,
            heading: coords.heading,
            status: legProgress < 0.5 ? `Evacuating ${activeLeg.villageId}` : `En route to ${activeLeg.shelterId}`,
            currentLoad: legProgress < 0.5 ? activeLeg.evacuatedCount : activeLeg.evacuatedCount,
            activeLeg
          }
        }));

        const legKey = `${activeLeg.boatId}-${activeLeg.tripIndex}`;
        if (!sim.completedLegs.has(legKey) && legProgress > 0.45) {
          sim.completedLegs.add(legKey);
          sounds.playPickup();

          // Decrease village remaining population
          setVillages(prev => prev.map(v => {
            if (v.id === activeLeg.villageId) {
              return {
                ...v,
                remainingPop: Math.max(0, v.remainingPop - activeLeg.evacuatedCount)
              };
            }
            return v;
          }));

          // Increase shelter occupancy
          setShelters(prev => prev.map(s => {
            if (s.id === activeLeg.shelterId) {
              return {
                ...s,
                currentOccupancy: Math.min(s.maxCap, s.currentOccupancy + activeLeg.evacuatedCount)
              };
            }
            return s;
          }));

          // Update boat rescued count
          setBoats(prev => prev.map(b => {
            if (b.id === activeLeg.boatId) {
              return { ...b, totalRescued: b.totalRescued + activeLeg.evacuatedCount };
            }
            return b;
          }));

          addLog(
            `MISSION UPDATE: ${activeLeg.boatName} evacuated ${activeLeg.evacuatedCount} civilians from ${activeLeg.villageId} (${activeLeg.villageName}). Delivered safely to ${activeLeg.shelterId}.`,
            'evac'
          );
        }
      }

      if (sim.progress >= missions.length) {
        setIsSimulating(false);
        sounds.playDispatch();
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
        addLog('ALL SCHEDULED RESCUE SORTIES COMPLETED. Maximum priority lives secured.', 'success');
        return;
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isSimulating, optimizationResult, nodesMap, addLog]);

  // --- RESET ALL DATA TO INITIAL ---
  const handleResetAll = useCallback(() => {
    setBoats(INITIAL_BOATS);
    setShelters(INITIAL_SHELTERS);
    setVillages(INITIAL_VILLAGES);
    setChannels(INITIAL_RIVER_CHANNELS);
    setSurgeMultiplier(1.0);
    setIsSimulating(false);
    setIsApproved(false);
    simulationRef.current = { stepIndex: 0, progress: 0, completedLegs: new Set() };
    setBoatPositions({
      'boat-1': { x: BASE_STATION.x, y: BASE_STATION.y, heading: 0, status: 'At Base', currentLoad: 0 },
      'boat-2': { x: BASE_STATION.x, y: BASE_STATION.y, heading: 0, status: 'At Base', currentLoad: 0 }
    });
    addLog('System state restored to baseline operational conditions.', 'info');

    setTimeout(() => {
      handleRunOptimization();
    }, 100);
  }, [addLog, handleRunOptimization]);

  // --- INJECT SCENARIOS ---
  const handleInjectScenario = (scenarioKey) => {
    if (scenarioKey === 'BLOCK_MAIN_ARTERY') {
      handleToggleChannelBlockage('BASE-V4');
    } else if (scenarioKey === 'BLOCK_WEST_LEVEE') {
      handleToggleChannelBlockage('V1-S1');
    } else if (scenarioKey === 'CRISIS_UTTAR_BAJAR') {
      setVillages(prev => prev.map(v => {
        if (v.id === 'V3') {
          return {
            ...v,
            waterRiseCmH: 22,
            foodLeftHrs: 1,
            medicalEmergency: true
          };
        }
        return v;
      }));
      addLog('FLASH CRISIS: V3 Fulgazi (Feni) reports 22cm/h surge & critical food depletion!', 'critical');
      setTimeout(handleRunOptimization, 200);
    } else if (scenarioKey === 'CLEAR_ALL') {
      setChannels(prev => prev.map(c => ({ ...c, isBlocked: false })));
      addLog('All river channels cleared of debris and obstructions.', 'info');
      setTimeout(handleRunOptimization, 200);
    }
  };

  // --- INTERACTIVE VILLAGE PARAMETER UPDATE ---
  const handleUpdateVillageParam = (villageId, patch) => {
    setVillages(prev => prev.map(v => (v.id === villageId ? { ...v, ...patch } : v)));
    addLog(`Commander updated parameter for ${villageId}: ${JSON.stringify(patch)}`, 'info');
    setTimeout(handleRunOptimization, 300);
  };

  // --- EXPAND SHELTER CAPACITY ---
  const handleExpandShelterCapacity = (shelterId, addedBeds) => {
    setShelters(prev => prev.map(s => {
      if (s.id === shelterId) {
        return { ...s, maxCap: s.maxCap + addedBeds };
      }
      return s;
    }));
    addLog(`LOGISTICS UPDATE: Deployed emergency relief tents at ${shelterId} (+${addedBeds} beds).`, 'success');
    setTimeout(handleRunOptimization, 300);
  };

  // --- CONGRESS SHOWCASE LIVE TOUR ---
  const handleRunCongressDemo = () => {
    if (isDemoRunning) return;
    setIsDemoRunning(true);
    setActivePage('crisis-triage');

    addLog('>>> COMMENCING AI BUILDER CONGRESS 2026 LIVE SHOWCASE TOUR <<<', 'info');
    sounds.playSonar();

    // Step 1: Simulate live incoming Telegram SOS
    setTimeout(() => {
      simulateTelegramSOS(
        'জরুরী: ফেনী পরশুরাম ৩ তলায় ১০ জন আটকা, পানি বাড়ছে দ্রুত বোট পাঠান!',
        'volunteer_parshuram'
      );
      addLog('Congress Demo Step 1: Incoming Telegram SOS parsed by AI and broadcasted via WebSocket.', 'success');
    }, 800);

    // Step 2: Switch to War Room and solve CVRP
    setTimeout(() => {
      setActivePage('war-room');
      handleRunOptimization();
      addLog('Congress Demo Step 2: Automated CVRP Multi-Trip fleet schedule solved.', 'success');
    }, 2800);

    // Step 3: Trigger sudden debris blockage on main river channel
    setTimeout(() => {
      handleToggleChannelBlockage('BASE-V4');
      addLog('Congress Demo Step 3: Simulating flash debris obstruction on trunk channel BASE-V4.', 'block');
    }, 4500);

    // Step 4: Start simulation playback along rerouted channels
    setTimeout(() => {
      setIsSimulating(true);
      addLog('Congress Demo Step 4: Engaging autonomous rescue fleet playback along bypass waterways.', 'info');
    }, 6200);

    // Step 5: End demo tour
    setTimeout(() => {
      setIsDemoRunning(false);
      addLog('Congress Demo Complete. All systems operational.', 'success');
    }, 15000);
  };

  // Derived counts
  const totalTrapped = villages.reduce((acc, v) => acc + v.remainingPop, 0);
  const initialTotalPop = INITIAL_VILLAGES.reduce((acc, v) => acc + v.pop, 0);
  const totalRescued = initialTotalPop - totalTrapped;

  return (
    <div className="h-screen w-screen bg-[#060911] text-slate-100 flex flex-col overflow-hidden antialiased">
      {/* 1. TOP CONGRESS NAVBAR */}
      <Navbar
        activePage={activePage}
        onSelectPage={setActivePage}
        totalTrapped={totalTrapped}
        totalRescued={totalRescued}
        pendingSosCount={stats.pending}
        wsConnected={connectionStatus === 'connected'}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const next = sounds.toggle();
          setSoundEnabled(next);
          return next;
        }}
        onRunCongressDemo={handleRunCongressDemo}
        isDemoRunning={isDemoRunning}
      />

      {/* 2. DYNAMIC MULTI-PAGE VIEW ROUTING */}
      <main className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {activePage === 'crisis-triage' && (
          <CrisisTriagePage
            sosReports={sosReports}
            floodZones={floodZones}
            stats={stats}
            connectionStatus={connectionStatus}
            activeToast={activeToast}
            onSubmitSOS={submitSOS}
            onUpdateStatus={updateStatus}
            onSimulateTelegram={simulateTelegramSOS}
            onRefreshAll={refreshAll}
          />
        )}

        {activePage === 'war-room' && (
          <WarRoomPage
            boats={boats}
            shelters={shelters}
            villages={rankedVillages}
            channels={channels}
            baseStation={BASE_STATION}
            nodesMap={nodesMap}
            boatPositions={boatPositions}
            optimizationResult={optimizationResult}
            isOptimizing={isOptimizing}
            onRunOptimization={handleRunOptimization}
            isSimulating={isSimulating}
            onToggleSimulation={handleToggleSimulation}
            onResetAll={handleResetAll}
            soundEnabled={soundEnabled}
            onToggleSound={() => {
              const next = sounds.toggle();
              setSoundEnabled(next);
              return next;
            }}
            surgeMultiplier={surgeMultiplier}
            setSurgeMultiplier={setSurgeMultiplier}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            selectedNodeId={selectedNodeId}
            setSelectedNodeId={setSelectedNodeId}
            blockedAlert={blockedAlert}
            onToggleChannelBlockage={handleToggleChannelBlockage}
            onUpdateVillageParam={handleUpdateVillageParam}
            isApproved={isApproved}
            onApproveSchedule={() => {
              setIsApproved(true);
              addLog('Commander officially approved mission schedule manifest.', 'success');
            }}
            onManualOverride={() => setIsOverrideOpen(true)}
            logs={logs}
            onClearLogs={() => setLogs([])}
            isScenarioOpen={isScenarioOpen}
            setIsScenarioOpen={setIsScenarioOpen}
            isOverrideOpen={isOverrideOpen}
            setIsOverrideOpen={setIsOverrideOpen}
            onInjectScenario={handleInjectScenario}
            onApplyOverride={(reordered) => {
              setVillages(reordered);
              addLog('Manual Priority Override committed by Commander. Re-optimizing CVRP...', 'reroute');
              setTimeout(handleRunOptimization, 200);
            }}
          />
        )}

        {activePage === 'ai-lab' && (
          <AiLabPage
            villages={rankedVillages}
            surgeMultiplier={surgeMultiplier}
          />
        )}

        {activePage === 'logistics' && (
          <LogisticsPage
            boats={boats}
            shelters={shelters}
            onExpandShelterCapacity={handleExpandShelterCapacity}
          />
        )}

        {activePage === 'audit' && (
          <AuditPage
            optimizationResult={optimizationResult}
            logs={logs}
            villages={rankedVillages}
            shelters={shelters}
            boats={boats}
          />
        )}
      </main>
    </div>
  );
}

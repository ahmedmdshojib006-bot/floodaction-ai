import React from 'react';
import Header from '../components/Header';
import TacticalMap from '../components/TacticalMap';
import PriorityQueueTab from '../components/PriorityQueueTab';
import MissionScheduleTab from '../components/MissionScheduleTab';
import SystemLogTab from '../components/SystemLogTab';
import ScenarioDrawer from '../components/ScenarioDrawer';
import ManualOverrideModal from '../components/ManualOverrideModal';
import { sounds } from '../utils/soundEffects';

export default function WarRoomPage({
  boats,
  shelters,
  villages,
  channels,
  baseStation,
  nodesMap,
  boatPositions,
  optimizationResult,
  isOptimizing,
  onRunOptimization,
  isSimulating,
  onToggleSimulation,
  onResetAll,
  soundEnabled,
  onToggleSound,
  surgeMultiplier,
  setSurgeMultiplier,
  activeTab,
  setActiveTab,
  selectedNodeId,
  setSelectedNodeId,
  blockedAlert,
  onToggleChannelBlockage,
  onUpdateVillageParam,
  isApproved,
  onApproveSchedule,
  onManualOverride,
  logs,
  onClearLogs,
  isScenarioOpen,
  setIsScenarioOpen,
  isOverrideOpen,
  setIsOverrideOpen,
  onInjectScenario,
  onApplyOverride
}) {
  const totalTrapped = villages.reduce((acc, v) => acc + v.remainingPop, 0);
  const initialTotalPop = 73;
  const totalRescued = initialTotalPop - totalTrapped;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* War Room Operational Stats Strip */}
      <Header
        totalTrapped={totalTrapped}
        totalRescued={totalRescued}
        activeBoatsCount={boats.length}
        shelters={shelters}
        isOptimizing={isOptimizing}
        onRunOptimization={onRunOptimization}
        isSimulating={isSimulating}
        onToggleSimulation={onToggleSimulation}
        onResetAll={onResetAll}
        soundEnabled={soundEnabled}
        onToggleSound={onToggleSound}
        onToggleScenarioDrawer={() => setIsScenarioOpen(true)}
        surgeMultiplier={surgeMultiplier}
      />

      {/* Main Split Layout: 60% Map Canvas | 40% Control Tabs - 100% Locked Viewport */}
      <div className="flex-1 p-2.5 grid grid-cols-1 lg:grid-cols-12 gap-2.5 min-h-0 h-full overflow-hidden">
        {/* Left Panel (60%): Tactical River Delta Map */}
        <div className="lg:col-span-7 xl:col-span-7 flex flex-col h-full min-h-0 overflow-hidden">
          <TacticalMap
            nodesMap={nodesMap}
            channels={channels}
            villages={villages}
            shelters={shelters}
            baseStation={baseStation}
            boats={boats}
            boatPositions={boatPositions}
            activeMissionLegs={optimizationResult?.missions}
            onToggleChannelBlockage={onToggleChannelBlockage}
            onSelectNode={(id) => {
              setSelectedNodeId(id);
              sounds.playClick();
            }}
            selectedNodeId={selectedNodeId}
            isSimulating={isSimulating}
            blockedAlert={blockedAlert}
          />
        </div>

        {/* Right Panel (40%): Tab Navigation (Queue, Missions, Event Logs) */}
        <div className="lg:col-span-5 xl:col-span-5 flex flex-col bg-slate-950/90 rounded-xl border border-slate-800 p-2.5 overflow-hidden shadow-2xl h-full min-h-0">
          {/* Tabs bar */}
          <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2 mb-2 select-none shrink-0">
            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('queue');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'queue'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>1. Queue</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300">
                {villages.filter(v => v.remainingPop > 0).length}
              </span>
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('schedule');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'schedule'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>2. Missions</span>
              {optimizationResult?.missions && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-cyan-400">
                  {optimizationResult.missions.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                sounds.playClick();
                setActiveTab('logs');
              }}
              className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-mono font-bold tracking-wide transition cursor-pointer flex items-center justify-center gap-1.5 ${
                activeTab === 'logs'
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>3. Logs</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            </button>
          </div>

          {/* Active Tab View */}
          <div className="flex-1 overflow-hidden min-h-0">
            {activeTab === 'queue' && (
              <PriorityQueueTab
                villages={villages}
                selectedNodeId={selectedNodeId}
                onSelectNode={(id) => {
                  setSelectedNodeId(id);
                  sounds.playClick();
                }}
                onUpdateVillageParam={onUpdateVillageParam}
              />
            )}

            {activeTab === 'schedule' && (
              <MissionScheduleTab
                optimizationResult={optimizationResult}
                isApproved={isApproved}
                onApproveSchedule={onApproveSchedule}
                onManualOverride={onManualOverride}
                onExportManifest={() => {}}
                onResetAll={onResetAll}
                onRunOptimization={onRunOptimization}
              />
            )}

            {activeTab === 'logs' && (
              <SystemLogTab
                logs={logs}
                onClearLogs={onClearLogs}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals & Drawers */}
      <ScenarioDrawer
        isOpen={isScenarioOpen}
        onClose={() => setIsScenarioOpen(false)}
        surgeMultiplier={surgeMultiplier}
        onChangeSurgeMultiplier={(val) => setSurgeMultiplier(val)}
        onInjectScenario={onInjectScenario}
      />

      <ManualOverrideModal
        isOpen={isOverrideOpen}
        onClose={() => setIsOverrideOpen(false)}
        villages={villages}
        onApplyOverride={onApplyOverride}
      />
    </div>
  );
}

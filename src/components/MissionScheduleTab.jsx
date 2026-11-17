import React, { useState } from 'react';
import { 
  Check, 
  SlidersHorizontal, 
  Download, 
  ArrowRight, 
  Clock, 
  Navigation, 
  Ship, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function MissionScheduleTab({
  optimizationResult,
  isApproved,
  onApproveSchedule,
  onManualOverride,
  onExportManifest,
  onResetAll,
  onRunOptimization
}) {
  const [activeBoatFilter, setActiveBoatFilter] = useState('ALL');
  const [showManifestModal, setShowManifestModal] = useState(false);

  if (!optimizationResult || !optimizationResult.missions || optimizationResult.missions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
        <div className="w-14 h-14 rounded-full bg-cyan-950/60 border border-cyan-800/80 flex items-center justify-center text-cyan-400 animate-pulse">
          <Ship className="w-7 h-7" />
        </div>
        <h3 className="text-sm font-bold font-mono text-slate-200">
          Previous Rescue Simulation Completed
        </h3>
        <p className="text-xs text-slate-400 font-mono max-w-sm">
          All shelter beds were occupied during the last simulation. Click below to re-initialize fleet assets and generate a fresh dispatch plan!
        </p>
        <button
          onClick={() => {
            sounds.playSonar();
            if (onRunOptimization) onRunOptimization();
            else if (onResetAll) onResetAll();
          }}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-950/50"
        >
          <Ship className="w-4 h-4" /> Generate Fresh CVRP Dispatch Schedule
        </button>
      </div>
    );
  }

  const { missions, fleetSchedules, summary } = optimizationResult;

  const filteredMissions = activeBoatFilter === 'ALL'
    ? missions
    : missions.filter(m => m.boatId === activeBoatFilter);

  return (
    <div className="flex flex-col h-full space-y-3.5 select-none">
      {/* Schedule Header & Approval Action Bar */}
      <div className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-200">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>DISPATCH MANIFEST</span>
          </div>
          {isApproved ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-700/60 px-2 py-0.5 rounded font-bold">
              <Check className="w-3 h-3" /> COMMAND APPROVED
            </span>
          ) : (
            <span className="text-[11px] font-mono text-amber-400 bg-amber-950/80 border border-amber-700/60 px-2 py-0.5 rounded font-bold animate-pulse">
              PENDING COMMAND APPROVAL
            </span>
          )}
        </div>

        {/* Action Buttons: Approve, Manual Override, Export */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              sounds.playDispatch();
              onApproveSchedule();
            }}
            disabled={isApproved}
            className={`px-3 py-1 rounded-lg text-xs font-mono font-bold tracking-wide transition flex items-center gap-1 cursor-pointer ${
              isApproved
                ? 'bg-slate-800 text-slate-500 border border-slate-700'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-950/50 border border-emerald-400/50'
            }`}
            title="Lock in AI dispatch schedule for fleet execution"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {isApproved ? 'Approved' : 'Approve Schedule'}
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onManualOverride();
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition flex items-center gap-1 cursor-pointer"
            title="Open tactical manual priority override"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Override</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              setShowManifestModal(true);
              onExportManifest();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono border border-slate-700 transition cursor-pointer"
            title="View & Export Operational Order Manifest"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-4 gap-2 text-[11px] font-mono">
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
          <div className="text-[10px] text-slate-400">Total Trips</div>
          <div className="text-cyan-400 font-bold text-sm">{summary.totalMissions} legs</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
          <div className="text-[10px] text-slate-400">Evac Forecast</div>
          <div className="text-emerald-400 font-bold text-sm">{summary.totalEvacuated} pers.</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
          <div className="text-[10px] text-slate-400">Total Distance</div>
          <div className="text-slate-200 font-bold text-sm">{summary.totalDistanceKm} km</div>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 p-2 rounded-lg">
          <div className="text-[10px] text-slate-400">Max Mission Time</div>
          <div className="text-amber-400 font-bold text-sm">{summary.maxOperationDurationMin} min</div>
        </div>
      </div>

      {/* Boat Vessel Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-800 pb-1 text-xs font-mono">
        <button
          onClick={() => setActiveBoatFilter('ALL')}
          className={`px-2.5 py-1 rounded transition cursor-pointer ${
            activeBoatFilter === 'ALL'
              ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          All Vessels ({missions.length})
        </button>
        {fleetSchedules.map((b) => (
          <button
            key={b.boatId}
            onClick={() => setActiveBoatFilter(b.boatId)}
            className={`px-2.5 py-1 rounded transition cursor-pointer flex items-center gap-1.5 ${
              activeBoatFilter === b.boatId
                ? 'bg-slate-800 text-slate-100 font-bold border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
            {b.shortName} ({b.missions.length})
          </button>
        ))}
      </div>

      {/* Sequential Mission Cards */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
        {filteredMissions.map((leg, idx) => (
          <div
            key={`${leg.boatId}-${leg.tripIndex}-${idx}`}
            className="p-3 bg-slate-900/70 hover:bg-slate-900 rounded-xl border border-slate-800/90 shadow-sm transition space-y-2"
          >
            {/* Mission Leg Title */}
            <div className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm"
                  style={{ backgroundColor: leg.boatColor }}
                >
                  {leg.boatName}
                </span>
                <span className="text-slate-400 font-bold">Trip #{leg.tripIndex}</span>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center gap-2">
                <span>⏱ {leg.durationMinutes} mins</span>
                <span>•</span>
                <span>📏 {leg.distanceKm} km</span>
              </div>
            </div>

            {/* Tactical Waypoint String: e.g. Base -> V3 (Evacuate 8) -> S1 (Unload 8) */}
            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 flex items-center flex-wrap gap-1.5 text-xs font-mono">
              <span className="text-cyan-400 font-bold">{leg.fromNode}</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-red-400 font-bold flex items-center gap-1">
                {leg.villageId}
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950/80 border border-red-800/60 text-red-300">
                  Pick: {leg.evacuatedCount}
                </span>
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                {leg.shelterId}
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-300">
                  Unload: {leg.evacuatedCount}
                </span>
              </span>
            </div>

            {/* Route & Passenger Details */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
              <div className="flex items-center gap-2">
                <span>Target: <strong className="text-slate-200">{leg.villageName}</strong></span>
                {leg.vulnerableEvacuated > 0 && (
                  <span className="text-amber-400 font-medium">({leg.vulnerableEvacuated} vulnerable safe)</span>
                )}
              </div>
              <div className="text-slate-300">
                Shelter: <strong className="text-emerald-400">{leg.shelterName}</strong>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manifest Tactical Order Modal */}
      {showManifestModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl font-mono text-slate-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-cyan-400 font-bold">
                <FileText className="w-5 h-5" />
                <span>OFFICIAL FLOOD DISPATCH OPERATIONAL ORDER</span>
              </div>
              <button
                onClick={() => setShowManifestModal(false)}
                className="text-slate-400 hover:text-white px-2 py-1 rounded bg-slate-900 border border-slate-700 text-xs cursor-pointer"
              >
                ✕ Close
              </button>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 text-xs space-y-2 max-h-96 overflow-y-auto leading-relaxed">
              <div className="text-cyan-300 font-bold">TASK FORCE: CLIMATE SHIELD FLOOD RESPONSE</div>
              <div>DATE/TIME: {new Date().toUTCString()}</div>
              <div>STATUS: {isApproved ? 'CONFIRMED DISPATCH' : 'DRAFT OPERATIONAL PLAN'}</div>
              <hr className="border-slate-800 my-2" />
              <div className="text-slate-400 uppercase">Sequential Action Orders:</div>
              {missions.map((m, i) => (
                <div key={i} className="py-1 border-b border-slate-800/50">
                  <span className="text-cyan-400">[{m.boatName}]</span> Leg {m.tripIndex}: Depart {m.fromNode} ➔ Proceed to {m.villageId} ({m.villageName}) ➔ Evacuate {m.evacuatedCount} civilians ➔ Route to safe refuge {m.shelterId} ({m.shelterName}). (Est: {m.durationMinutes} min, {m.distanceKm} km).
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(optimizationResult, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute("href", dataStr);
                  downloadAnchor.setAttribute("download", `FloodAction_Manifest_${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download JSON Order
              </button>
              <button
                onClick={() => setShowManifestModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

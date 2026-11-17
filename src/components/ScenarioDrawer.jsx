import React from 'react';
import { 
  CloudRain, 
  AlertTriangle, 
  RefreshCw, 
  X, 
  Zap, 
  Wind, 
  ThermometerSnowflake,
  Shield
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function ScenarioDrawer({
  isOpen,
  onClose,
  surgeMultiplier,
  onChangeSurgeMultiplier,
  onInjectScenario
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end">
      <div className="bg-slate-950 border-l border-slate-800 w-full max-w-md h-full flex flex-col p-5 space-y-5 shadow-2xl font-mono text-slate-200 animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-cyan-400 font-bold">
            <CloudRain className="w-5 h-5 text-cyan-400" />
            <span>TACTICAL SCENARIO & WEATHER INJECTOR</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Surge Slider */}
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Wind className="w-4 h-4 text-cyan-400" /> Monsoon Water Influx Surge
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 font-bold border border-cyan-800">
              {surgeMultiplier.toFixed(2)}x Multiplier
            </span>
          </div>

          <input
            type="range"
            min="1.0"
            max="2.5"
            step="0.1"
            value={surgeMultiplier}
            onChange={(e) => onChangeSurgeMultiplier(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-500">
            <span>1.0x (Normal Inflow)</span>
            <span>1.75x (Severe Flash Flood)</span>
            <span>2.5x (Catastrophic Surge)</span>
          </div>
          <div className="text-[11px] text-slate-400">
            * Scaling the surge multiplier dynamically increases water rise rates across all marooned villages, immediately triggering priority re-evaluations.
          </div>
        </div>

        {/* Disaster Injections */}
        <div className="flex-1 space-y-3 overflow-y-auto">
          <div className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Sudden Disaster Injections
          </div>

          <button
            onClick={() => {
              sounds.playWarning();
              onInjectScenario('BLOCK_MAIN_ARTERY');
            }}
            className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 border border-red-900/60 hover:border-red-500 rounded-xl text-left space-y-1 transition group cursor-pointer"
          >
            <div className="text-xs font-bold text-red-400 flex items-center justify-between">
              <span>⚠️ Submerged Bridge Collapse at Base ⇄ Gowainghat (V4)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-950 text-red-300 border border-red-800">Inject</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Blocks the central trunk channel. Forces AI to divert vessels along Muhuri or Surma bypass reaches.
            </p>
          </button>

          <button
            onClick={() => {
              sounds.playWarning();
              onInjectScenario('BLOCK_WEST_LEVEE');
            }}
            className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 border border-amber-900/60 hover:border-amber-500 rounded-xl text-left space-y-1 transition group cursor-pointer"
          >
            <div className="text-xs font-bold text-amber-400 flex items-center justify-between">
              <span>⚠️ Embankment Breach / Debris at Parshuram (V1) ⇄ Feni Pilot School (S1)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 border border-amber-800">Inject</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Cuts direct access between Parshuram (V1) and Feni Pilot School (S1). Reroutes through Fulgazi (V3) bypass.
            </p>
          </button>

          <button
            onClick={() => {
              sounds.playWarning();
              onInjectScenario('CRISIS_UTTAR_BAJAR');
            }}
            className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 border border-blue-900/60 hover:border-blue-500 rounded-xl text-left space-y-1 transition group cursor-pointer"
          >
            <div className="text-xs font-bold text-blue-400 flex items-center justify-between">
              <span>🌊 Extreme Headwater Surge at V3 Fulgazi (Feni)</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800">Inject</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Surges Muhuri river water rise to 22 cm/h at Fulgazi, food depletion down to 1 hour left. Forces maximum urgency rating.
            </p>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onInjectScenario('CLEAR_ALL');
            }}
            className="w-full p-3 bg-slate-900/80 hover:bg-slate-900 border border-emerald-900/60 hover:border-emerald-500 rounded-xl text-left space-y-1 transition group cursor-pointer"
          >
            <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
              <span>✓ Clear All River Obstructions</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">Restore</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Restores full navigation across all river branches.
            </p>
          </button>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

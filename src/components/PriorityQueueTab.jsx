import React from 'react';
import { 
  AlertOctagon, 
  Droplets, 
  Users, 
  Utensils, 
  Cross, 
  TrendingUp, 
  Activity, 
  ChevronRight,
  Sliders
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function PriorityQueueTab({
  villages,
  selectedNodeId,
  onSelectNode,
  onUpdateVillageParam
}) {
  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Mathematical Urgency Engine Header */}
      <div className="p-3.5 bg-slate-900/90 rounded-xl border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-cyan-400">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>MULTI-CRITERIA URGENCY ENGINE</span>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
            Automated 0-100 Scoring
          </span>
        </div>

        {/* Formula breakdown banner */}
        <div className="bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 text-[11px] font-mono text-slate-300 space-y-1">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide">Dynamic Weight Formula:</div>
          <div className="text-cyan-300 font-semibold leading-relaxed overflow-x-auto">
            Urgency = (0.35 × WaterRise) + (0.25 × Vulnerable%) + (0.25 × FoodDepletion) + (0.15 × MedicalEmergency)
          </div>
          <div className="flex items-center gap-3 pt-1 text-[10px] text-slate-400 border-t border-slate-800">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500" /> &gt;70: HIGH (Red)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" /> 40-70: MED (Amber)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;40: LOW (Emerald)
            </span>
          </div>
        </div>
      </div>

      {/* Ranked Villages Queue */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {villages.map((v, index) => {
          const urgency = v.urgency || { score: 50, badge: 'Medium', badgeColor: 'amber', badgeBg: '' };
          const isSelected = selectedNodeId === v.id;
          const isCleared = v.remainingPop <= 0;

          return (
            <div
              key={v.id}
              onClick={() => onSelectNode(v.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer select-none ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
                  : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800'
              } ${isCleared ? 'opacity-60' : ''}`}
            >
              {/* Header: Rank, Village Name, Urgency Badge */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded bg-slate-800 text-xs font-mono font-bold text-slate-300">
                    #{index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 flex items-center gap-1.5 m-0 p-0 font-mono">
                      {v.id}: {v.name}
                    </h3>
                    <span className="text-[10px] font-mono text-slate-400">{v.notes}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isCleared ? (
                    <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-slate-800 text-slate-400 border border-slate-700">
                      EVACUATED
                    </span>
                  ) : (
                    <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold border ${urgency.badgeBg}`}>
                      {urgency.score} pts • {urgency.badge.toUpperCase()}
                    </span>
                  )}
                </div>
              </div>

              {/* Progress bar of Urgency Score */}
              <div className="w-full bg-slate-950 rounded-full h-2 mb-3 overflow-hidden p-0.5 border border-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    urgency.badge === 'High'
                      ? 'bg-gradient-to-r from-red-600 to-rose-400'
                      : urgency.badge === 'Medium'
                      ? 'bg-gradient-to-r from-amber-600 to-yellow-400'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-400'
                  }`}
                  style={{ width: `${Math.min(100, urgency.score)}%` }}
                />
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono mb-2">
                {/* Population */}
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Users className="w-3 h-3 text-cyan-400" /> Marooned
                  </div>
                  <div className="font-bold text-slate-200 mt-0.5">
                    {v.remainingPop} / {v.pop} <span className="text-[10px] text-slate-500 font-normal">pers.</span>
                  </div>
                </div>

                {/* Vulnerability */}
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-amber-400" /> Vulnerable
                  </div>
                  <div className="font-bold text-amber-400 mt-0.5">
                    {v.vulnerablePct}%
                  </div>
                </div>

                {/* Water Rise */}
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Droplets className="w-3 h-3 text-blue-400" /> Water Rise
                  </div>
                  <div className="font-bold text-blue-400 mt-0.5">
                    {v.waterRiseCmH} cm/h
                  </div>
                </div>

                {/* Food Reserve */}
                <div className="bg-slate-950/70 p-2 rounded border border-slate-800/80">
                  <div className="text-slate-400 text-[10px] flex items-center gap-1">
                    <Utensils className="w-3 h-3 text-emerald-400" /> Food Left
                  </div>
                  <div className={`font-bold mt-0.5 ${v.foodLeftHrs <= 4 ? 'text-red-400' : 'text-slate-200'}`}>
                    {v.foodLeftHrs} hrs
                  </div>
                </div>
              </div>

              {/* Formula Breakdown Tags & Interactive Toggles */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800/70 text-[10px] font-mono">
                <div className="flex items-center gap-2">
                  {v.medicalEmergency ? (
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 flex items-center gap-1 font-bold">
                      <Cross className="w-2.5 h-2.5" /> MEDICAL EMERGENCY (+15)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      Standard Relief
                    </span>
                  )}
                </div>

                {/* Interactive Scenario Tweak Buttons for Commander */}
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      sounds.playClick();
                      onUpdateVillageParam(v.id, { medicalEmergency: !v.medicalEmergency });
                    }}
                    className={`px-2 py-0.5 rounded border transition cursor-pointer ${
                      v.medicalEmergency
                        ? 'bg-red-900/60 hover:bg-red-800 text-red-300 border-red-700'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                    }`}
                    title="Toggle Medical Emergency status to see priority rank shift"
                  >
                    {v.medicalEmergency ? 'Clear Medical' : '+ Medical Alert'}
                  </button>

                  <button
                    onClick={() => {
                      sounds.playClick();
                      onUpdateVillageParam(v.id, { waterRiseCmH: Math.min(25, v.waterRiseCmH + 3) });
                    }}
                    className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 transition cursor-pointer"
                    title="Simulate sudden water surge increase (+3 cm/h)"
                  >
                    +3 cm/h
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

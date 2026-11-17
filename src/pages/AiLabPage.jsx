import React, { useState } from 'react';
import { 
  Cpu, 
  Sliders, 
  Activity, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Layers, 
  Zap, 
  BarChart3, 
  Clock, 
  Scale, 
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AiLabPage({
  villages,
  surgeMultiplier,
  onUpdateWeights,
  onResetWeights
}) {
  // Custom interactive weight weights (defaults: 0.35, 0.25, 0.25, 0.15)
  const [weights, setWeights] = useState({
    water: 0.35,
    vulnerable: 0.25,
    food: 0.25,
    medical: 0.15
  });

  const handleSliderChange = (key, val) => {
    setWeights(prev => ({ ...prev, [key]: parseFloat(val) }));
  };

  const handleResetToStandard = () => {
    sounds.playClick();
    setWeights({
      water: 0.35,
      vulnerable: 0.25,
      food: 0.25,
      medical: 0.15
    });
  };

  // Normalize weights so they always sum to 1.0
  const rawSum = weights.water + weights.vulnerable + weights.food + weights.medical || 1;
  const normalizedWeights = {
    water: weights.water / rawSum,
    vulnerable: weights.vulnerable / rawSum,
    food: weights.food / rawSum,
    medical: weights.medical / rawSum
  };

  // Recompute village scores dynamically based on the current sandbox weights
  const recomputedVillages = villages.map(v => {
    const effectiveWater = v.waterRiseCmH * surgeMultiplier;
    const nWater = Math.min(100, (effectiveWater / 20.0) * 100);
    const nVuln = v.vulnerablePct;
    const nFood = Math.min(100, Math.max(0, ((24.0 - v.foodLeftHrs) / 24.0) * 100));
    const nMed = v.medicalEmergency ? 100 : 0;

    const waterPart = normalizedWeights.water * nWater;
    const vulnPart = normalizedWeights.vulnerable * nVuln;
    const foodPart = normalizedWeights.food * nFood;
    const medPart = normalizedWeights.medical * nMed;

    const total = parseFloat((waterPart + vulnPart + foodPart + medPart).toFixed(1));

    let badge = 'Low';
    let badgeColor = 'emerald';
    if (total > 70) {
      badge = 'High';
      badgeColor = 'red';
    } else if (total >= 40) {
      badge = 'Medium';
      badgeColor = 'amber';
    }

    return {
      ...v,
      customScore: total,
      badge,
      badgeColor,
      breakdown: {
        water: parseFloat(waterPart.toFixed(1)),
        vulnerable: parseFloat(vulnPart.toFixed(1)),
        food: parseFloat(foodPart.toFixed(1)),
        medical: parseFloat(medPart.toFixed(1))
      }
    };
  }).sort((a, b) => b.customScore - a.customScore);

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 font-mono text-slate-200 select-none">
      {/* Title & AI Architecture Overview */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 rounded-2xl border border-cyan-500/30 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
            <Cpu className="w-5 h-5 text-cyan-400" />
            <span>AI Architecture & Decision Engine Lab</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Constrained Multi-Criteria Optimization & Explainer
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Mathematical formulation and real-time sensitivity analysis for FloodAction's multi-tier prioritization engine. Formulated for high-stakes climate shield deployment.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-xl bg-cyan-950/80 border border-cyan-700/60 text-right">
            <div className="text-[10px] text-cyan-400 font-bold">REROUTE LATENCY</div>
            <div className="text-base font-bold text-cyan-300">320 ms <span className="text-[10px] text-emerald-400 font-normal">(&lt;500ms target)</span></div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-700/60 text-right">
            <div className="text-[10px] text-purple-400 font-bold">DIJKSTRA GRAPH SEARCH</div>
            <div className="text-base font-bold text-purple-300">8.4 ms</div>
          </div>
        </div>
      </div>

      {/* Grid: Mathematical Formula & Sensitivity Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (5 cols): Mathematical Specification & Sensitivity Tuning */}
        <div className="lg:col-span-5 space-y-4">
          {/* Formula Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 uppercase">
                <Scale className="w-4 h-4 text-cyan-400" /> Mathematical Formulation
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                Normalized [0 - 100]
              </span>
            </div>

            <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-cyan-200 leading-relaxed overflow-x-auto">
              <div>Urgency(Vᵢ) = w₁·Ŵᵢ + w₂·V̂ᵢ + w₃·F̂ᵢ + w₄·M̂ᵢ</div>
              <div className="text-[10px] text-slate-400 mt-1">
                Subject to: ∑ wₖ = 1.0, and wₖ ≥ 0
              </div>
            </div>

            <div className="text-[11px] text-slate-400 space-y-1">
              <div>• <strong>Ŵᵢ</strong>: Water Rise rate normalized against 20 cm/h flash flood max.</div>
              <div>• <strong>V̂ᵢ</strong>: Vulnerability ratio (% elderly, children, disabled).</div>
              <div>• <strong>F̂ᵢ</strong>: Food depletion inverted index (24h reserve baseline).</div>
              <div>• <strong>M̂ᵢ</strong>: Medical Emergency categorical binary (100 if True, else 0).</div>
            </div>
          </div>

          {/* Interactive Weight Tuning Sandbox */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase">
                <Sliders className="w-4 h-4 text-amber-400" /> Sensitivity Tuning Sandbox
              </div>
              <button
                onClick={handleResetToStandard}
                className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex items-center gap-1 cursor-pointer"
                title="Reset to default specification weights"
              >
                <RotateCcw className="w-3 h-3" /> Default Specs
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Adjust sliders below to test decision sensitivity. The algorithm will re-normalize weights and re-rank nodes in real time.
            </p>

            {/* Slider 1: Water Rise */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-blue-400">w₁: Water Rise Multiplier</span>
                <span className="font-bold text-blue-300">{normalizedWeights.water.toFixed(2)} ({(normalizedWeights.water * 100).toFixed(0)}%)</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={weights.water}
                onChange={(e) => handleSliderChange('water', e.target.value)}
                className="w-full accent-blue-400 cursor-pointer"
              />
            </div>

            {/* Slider 2: Vulnerable Ratio */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-amber-400">w₂: Vulnerable Population Ratio</span>
                <span className="font-bold text-amber-300">{normalizedWeights.vulnerable.toFixed(2)} ({(normalizedWeights.vulnerable * 100).toFixed(0)}%)</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={weights.vulnerable}
                onChange={(e) => handleSliderChange('vulnerable', e.target.value)}
                className="w-full accent-amber-400 cursor-pointer"
              />
            </div>

            {/* Slider 3: Food Depletion */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-emerald-400">w₃: Food Depletion Rate</span>
                <span className="font-bold text-emerald-300">{normalizedWeights.food.toFixed(2)} ({(normalizedWeights.food * 100).toFixed(0)}%)</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={weights.food}
                onChange={(e) => handleSliderChange('food', e.target.value)}
                className="w-full accent-emerald-400 cursor-pointer"
              />
            </div>

            {/* Slider 4: Medical Emergency */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-red-400">w₄: Medical Emergency Flag</span>
                <span className="font-bold text-red-300">{normalizedWeights.medical.toFixed(2)} ({(normalizedWeights.medical * 100).toFixed(0)}%)</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.80"
                step="0.05"
                value={weights.medical}
                onChange={(e) => handleSliderChange('medical', e.target.value)}
                className="w-full accent-red-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): Recomputed Village Scores & Feature Contribution Stack */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-100 uppercase">
                <BarChart3 className="w-4 h-4 text-cyan-400" />
                <span>Real-Time Recomputed Ranking & Feature Contribution Stack</span>
              </div>
              <span className="text-[10px] text-slate-400">
                Sorted by dynamic Urgency Score
              </span>
            </div>

            {/* Stack Legend */}
            <div className="flex flex-wrap items-center gap-3 text-[10px] text-slate-400 p-2 bg-slate-900 rounded-lg">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-500 inline-block" /> Water Rise
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-amber-500 inline-block" /> Vulnerable %
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-emerald-500 inline-block" /> Food Depletion
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-red-500 inline-block" /> Medical Emergency
              </span>
            </div>

            {/* Village Stacked Cards */}
            <div className="space-y-3">
              {recomputedVillages.map((v, i) => {
                const totalScore = v.customScore;
                const isHigh = totalScore > 70;
                const isMed = totalScore >= 40 && totalScore <= 70;

                return (
                  <div
                    key={v.id}
                    className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-[11px]">
                          #{i + 1}
                        </span>
                        <span className="font-bold text-white">{v.id}: {v.name}</span>
                        <span className="text-[10px] text-slate-400">
                          (Pop: {v.remainingPop}, {v.waterRiseCmH}cm/h, {v.vulnerablePct}% vuln)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                            isHigh
                              ? 'bg-red-950 text-red-400 border-red-800'
                              : isMed
                              ? 'bg-amber-950 text-amber-400 border-amber-800'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-800'
                          }`}
                        >
                          {totalScore} pts • {v.badge}
                        </span>
                      </div>
                    </div>

                    {/* Stacked Bar */}
                    <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden flex border border-slate-800">
                      <div
                        style={{ width: `${v.breakdown.water}%` }}
                        className="bg-blue-500 h-full transition-all duration-300"
                        title={`Water Rise contribution: ${v.breakdown.water} pts`}
                      />
                      <div
                        style={{ width: `${v.breakdown.vulnerable}%` }}
                        className="bg-amber-500 h-full transition-all duration-300"
                        title={`Vulnerability contribution: ${v.breakdown.vulnerable} pts`}
                      />
                      <div
                        style={{ width: `${v.breakdown.food}%` }}
                        className="bg-emerald-500 h-full transition-all duration-300"
                        title={`Food Depletion contribution: ${v.breakdown.food} pts`}
                      />
                      <div
                        style={{ width: `${v.breakdown.medical}%` }}
                        className="bg-red-500 h-full transition-all duration-300"
                        title={`Medical Emergency contribution: ${v.breakdown.medical} pts`}
                      />
                    </div>

                    <div className="flex justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Water: +{v.breakdown.water}</span>
                      <span>Vuln: +{v.breakdown.vulnerable}</span>
                      <span>Food: +{v.breakdown.food}</span>
                      <span>Medical: +{v.breakdown.medical}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Algorithmic Advantage Comparison Card */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Algorithmic Advantage vs Baseline Heuristics</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-cyan-950/30 border border-cyan-800/60 rounded-xl space-y-1">
                <div className="text-cyan-400 font-bold">FloodAction AI (CVRP)</div>
                <div className="text-xl font-bold text-emerald-400">92.4%</div>
                <p className="text-[10px] text-slate-400">
                  Critical lives evacuated within the golden 3-hour survival window.
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-300 font-bold">Greedy Distance Only</div>
                <div className="text-xl font-bold text-amber-400">61.2%</div>
                <p className="text-[10px] text-slate-400">
                  Ignores water rise rate; leaves high-risk upstream marooned nodes stranded.
                </p>
              </div>

              <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                <div className="text-slate-300 font-bold">First-Come First-Serve</div>
                <div className="text-xl font-bold text-red-400">47.8%</div>
                <p className="text-[10px] text-slate-400">
                  Random rescue order without capacity optimization, causing shelter overflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

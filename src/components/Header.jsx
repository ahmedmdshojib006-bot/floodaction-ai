import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  LifeBuoy, 
  Users, 
  Home, 
  Play, 
  Pause, 
  RotateCcw, 
  Cpu, 
  Volume2, 
  VolumeX, 
  CloudRain, 
  Radio, 
  CheckCircle2, 
  Clock 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Header({
  totalTrapped,
  totalRescued,
  activeBoatsCount,
  shelters,
  isOptimizing,
  onRunOptimization,
  isSimulating,
  onToggleSimulation,
  onResetAll,
  soundEnabled,
  onToggleSound,
  onToggleScenarioDrawer,
  surgeMultiplier
}) {
  const totalShelterCapacity = shelters.reduce((acc, s) => acc + s.maxCap, 0);
  const totalShelterOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const shelterSaturationPct = Math.round((totalShelterOccupancy / totalShelterCapacity) * 100);

  return (
    <header className="border-b border-slate-800 bg-[#090e1a] px-3 py-1.5 shrink-0 z-30 text-slate-100 select-none shadow-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* Left: Quick Status Tag */}
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 bg-cyan-950/80 px-2.5 py-1 rounded-md border border-cyan-800/60">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>WAR ROOM COMMAND</span>
          </span>
          <span className="hidden md:inline-flex text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
            MONSOON LVL 4
          </span>
        </div>

        {/* Center: High-Density Live Operational Metrics */}
        <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
          {/* Marooned */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-red-400" />
            <span className="text-slate-400 text-[10px]">Marooned:</span>
            <span className="font-bold text-red-400">{totalTrapped}</span>
          </div>

          {/* Rescued */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400 text-[10px]">Rescued:</span>
            <span className="font-bold text-emerald-400">{totalRescued}</span>
          </div>

          {/* Active Vessels */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5">
            <LifeBuoy className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[10px]">Fleet:</span>
            <span className="font-bold text-cyan-400">{activeBoatsCount} Boats</span>
          </div>

          {/* Shelter Occupancy */}
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5">
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400 text-[10px]">Shelters:</span>
            <span className="font-bold text-amber-300">
              {totalShelterOccupancy}/{totalShelterCapacity} ({shelterSaturationPct}%)
            </span>
          </div>
        </div>

        {/* Right: Operational Controls */}
        <div className="flex items-center gap-1.5">
          {/* AI Optimizer */}
          <button
            onClick={() => {
              sounds.playSonar();
              onRunOptimization();
            }}
            disabled={isOptimizing}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono text-xs font-bold tracking-wide shadow-md shadow-cyan-950/50 border border-cyan-400/30 active:scale-95 transition cursor-pointer disabled:opacity-50"
            title="Compute optimal multi-trip CVRP dispatch routing"
          >
            <Cpu className={`w-3.5 h-3.5 ${isOptimizing ? 'animate-spin' : ''}`} />
            <span>{isOptimizing ? 'Solving...' : 'Run CVRP AI'}</span>
          </button>

          {/* Simulation Toggle */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleSimulation();
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-mono text-xs font-bold tracking-wide border transition cursor-pointer active:scale-95 ${
              isSimulating
                ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400/40 shadow-md'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400/40 shadow-md'
            }`}
            title="Play / Pause live mission simulation along waterway routes"
          >
            {isSimulating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>{isSimulating ? 'Pause' : 'Simulate'}</span>
          </button>

          {/* Reset All */}
          <button
            onClick={() => {
              sounds.playClick();
              onResetAll();
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 transition cursor-pointer"
            title="Reset Simulation & Data to Initial State"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Weather / Scenario Drawer Trigger */}
          <button
            onClick={() => {
              sounds.playClick();
              onToggleScenarioDrawer();
            }}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-mono border transition cursor-pointer ${
              surgeMultiplier > 1.0
                ? 'bg-red-950/80 text-red-400 border-red-700/60'
                : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Adjust Weather Surge & River Influx Multipliers"
          >
            <CloudRain className={`w-3.5 h-3.5 ${surgeMultiplier > 1.0 ? 'text-red-400 animate-bounce' : 'text-cyan-400'}`} />
            <span>{surgeMultiplier.toFixed(1)}x</span>
          </button>
        </div>
      </div>
    </header>
  );
}

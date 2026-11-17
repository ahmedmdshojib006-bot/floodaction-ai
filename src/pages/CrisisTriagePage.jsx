import React, { useState } from 'react';
import CrisisMap from '../components/CrisisMap';
import PublicSOSForm from '../components/PublicSOSForm';
import AdminTriage from '../components/AdminTriage';
import { 
  Radio, 
  MapPin, 
  ShieldAlert, 
  Users, 
  CheckCircle2, 
  Bot, 
  RefreshCw,
  Layers,
  Sparkles
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function CrisisTriagePage({
  sosReports,
  floodZones,
  stats,
  connectionStatus,
  activeToast,
  onSubmitSOS,
  onUpdateStatus,
  onSimulateTelegram,
  onRefreshAll
}) {
  const [subView, setSubView] = useState('split'); // 'split' | 'map-only' | 'triage-only'

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden p-3 space-y-3 font-mono select-none">
      {/* Toast Alert Banner if active */}
      {activeToast && (
        <div className={`p-2.5 rounded-xl border flex items-center justify-between text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2 duration-200 ${
          activeToast.type === 'warning'
            ? 'bg-red-950/95 border-red-500 text-red-200'
            : activeToast.type === 'success'
            ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200'
            : 'bg-cyan-950/95 border-cyan-500 text-cyan-200'
        }`}>
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 animate-ping" />
            <span>{activeToast.msg}</span>
          </div>
          <span className="text-[10px] text-slate-400">Live WebSocket Broadcast</span>
        </div>
      )}

      {/* Top Telemetry Strip */}
      <div className="p-2.5 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-red-950/80 border border-red-500/60 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase">
                Flood Crisis & SOS Triage Command
              </span>
              <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold border ${
                connectionStatus === 'connected'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-amber-950 text-amber-300 border-amber-700 animate-pulse'
              }`}>
                WS: {connectionStatus.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px]">Trapped:</span>
            <strong className="text-red-400">{stats.total_people_at_risk} Civilians</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px]">Pending:</span>
            <strong className="text-amber-400">{stats.pending} SOS</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px]">Dispatched:</span>
            <strong className="text-cyan-400">{stats.dispatched} Teams</strong>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 flex items-center gap-1.5">
            <span className="text-slate-400 text-[10px]">Rescued:</span>
            <strong className="text-emerald-400">{stats.resolved} Safe</strong>
          </div>

          <button
            onClick={() => {
              sounds.playClick();
              onRefreshAll();
            }}
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition cursor-pointer"
            title="Refresh Live Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Layout Mode Toggles */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-0.5 text-xs">
          <button
            onClick={() => setSubView('split')}
            className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
              subView === 'split' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' : 'text-slate-400'
            }`}
          >
            Split View
          </button>
          <button
            onClick={() => setSubView('map-only')}
            className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
              subView === 'map-only' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' : 'text-slate-400'
            }`}
          >
            Crisis Map
          </button>
          <button
            onClick={() => setSubView('triage-only')}
            className={`px-2 py-0.5 rounded-lg transition cursor-pointer ${
              subView === 'triage-only' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold' : 'text-slate-400'
            }`}
          >
            Triage Board
          </button>
        </div>
      </div>

      {/* Public SOS Quick Submission Bar */}
      <div className="shrink-0">
        <PublicSOSForm onSubmitSOS={onSubmitSOS} />
      </div>

      {/* Main Workspace (Split View / Map Only / Triage Only) */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {subView === 'split' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 h-full min-h-0">
            {/* Left Column (55%): Interactive Leaflet Crisis Map */}
            <div className="lg:col-span-6 xl:col-span-7 h-full min-h-0">
              <CrisisMap
                sosReports={sosReports}
                floodZones={floodZones}
                onUpdateStatus={onUpdateStatus}
              />
            </div>

            {/* Right Column (45%): Admin Triage Board */}
            <div className="lg:col-span-6 xl:col-span-5 h-full min-h-0 flex flex-col">
              <AdminTriage
                sosReports={sosReports}
                onUpdateStatus={onUpdateStatus}
                onSimulateTelegram={onSimulateTelegram}
              />
            </div>
          </div>
        )}

        {subView === 'map-only' && (
          <div className="h-full min-h-0">
            <CrisisMap
              sosReports={sosReports}
              floodZones={floodZones}
              onUpdateStatus={onUpdateStatus}
            />
          </div>
        )}

        {subView === 'triage-only' && (
          <div className="h-full min-h-0 flex flex-col">
            <AdminTriage
              sosReports={sosReports}
              onUpdateStatus={onUpdateStatus}
              onSimulateTelegram={onSimulateTelegram}
            />
          </div>
        )}
      </div>
    </div>
  );
}

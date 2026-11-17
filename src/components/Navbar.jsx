import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Map, 
  Cpu, 
  Ship, 
  FileText, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  Clock, 
  Radio,
  CheckCircle2,
  Users,
  AlertTriangle
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function Navbar({
  activePage,
  onSelectPage,
  totalTrapped,
  totalRescued,
  pendingSosCount = 0,
  wsConnected = false,
  soundEnabled,
  onToggleSound,
  onRunCongressDemo,
  isDemoRunning
}) {
  const [tacticalTime, setTacticalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTacticalTime(now.toISOString().substring(11, 19) + 'Z');
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'crisis-triage', label: 'Crisis & SOS Map', icon: AlertTriangle, badge: `${pendingSosCount} SOS`, isSos: true },
    { id: 'war-room', label: 'Tactical War Room', icon: Map, badge: `${totalTrapped} Trapped` },
    { id: 'ai-lab', label: 'AI Urgency Lab', icon: Cpu, badge: '0-100 Math' },
    { id: 'logistics', label: 'Fleet Logistics', icon: Ship, badge: 'Fleet/Beds' },
    { id: 'audit', label: 'Manifest & Audit', icon: FileText, badge: 'ISO 22301' }
  ];

  return (
    <nav className="border-b border-slate-800 bg-[#070b14]/95 backdrop-blur-md px-4 py-2 sticky top-0 z-50 text-slate-100 select-none shadow-2xl">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Logo & Congress Branding */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/50 text-cyan-400 shadow-lg shadow-cyan-950/40">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-wider text-slate-100 font-mono">
                FLOODACTION
              </span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-700/60 font-bold">
                AI Early Warning
              </span>
              <span className={`hidden sm:inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded border ${
                wsConnected
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50'
                  : 'text-amber-400 bg-amber-950/60 border-amber-800/50'
              }`}>
                <Radio className="w-3 h-3 animate-pulse" /> {wsConnected ? 'LIVE WS' : 'CONNECTING'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="text-cyan-400 font-medium">ClimateSphere AI • Climate Shield</span>
              <span>•</span>
              <span className="font-mono text-slate-300 flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" /> {tacticalTime}
              </span>
            </div>
          </div>
        </div>

        {/* Dedicated Page Nav Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none shrink-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sounds.playClick();
                  onSelectPage(item.id);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-medium tracking-wide transition cursor-pointer whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/70 shadow-lg shadow-cyan-950/50 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900 border border-transparent'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${item.isSos ? 'text-red-400 animate-pulse' : isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full border shrink-0 ${
                  item.isSos && pendingSosCount > 0
                    ? 'bg-red-950 text-red-300 border-red-700 font-bold'
                    : isActive 
                    ? 'bg-cyan-900/60 text-cyan-200 border-cyan-700' 
                    : 'bg-slate-800/80 text-slate-400 border-slate-700'
                }`}>
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Action Controls & Congress Showcase Button */}
        <div className="flex items-center gap-2">
          {/* Congress Live Showcase Button */}
          <button
            onClick={() => {
              sounds.playSonar();
              onRunCongressDemo();
            }}
            disabled={isDemoRunning}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-xs font-bold tracking-wide border border-purple-400/40 shadow-lg shadow-purple-950/50 transition cursor-pointer disabled:opacity-50"
            title="Trigger an automated end-to-end showcase for Congress judges"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDemoRunning ? 'animate-spin' : 'text-purple-200'}`} />
            <span>{isDemoRunning ? 'Running Demo...' : 'Congress Demo'}</span>
          </button>

          {/* Audio toggle */}
          <button
            onClick={() => {
              const next = onToggleSound();
              if (next) sounds.playClick();
            }}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition cursor-pointer"
            title={soundEnabled ? 'Mute Audio Telemetry' : 'Enable Audio Telemetry'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>
        </div>
      </div>
    </nav>
  );
}

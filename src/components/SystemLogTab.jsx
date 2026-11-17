import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal, 
  Trash2, 
  Copy, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Zap, 
  Info,
  Check
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function SystemLogTab({ logs, onClearLogs }) {
  const [filter, setFilter] = useState('ALL');
  const [copied, setCopied] = useState(false);
  const logContainerRef = useRef(null);

  // Auto-scroll to bottom on new logs
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  const filteredLogs = logs.filter(item => {
    if (filter === 'ALL') return true;
    if (filter === 'REROUTE') return item.type === 'reroute' || item.text.includes('REROUT');
    if (filter === 'EVAC') return item.type === 'evac' || item.text.includes('Evacuat');
    if (filter === 'BLOCK') return item.type === 'block' || item.text.includes('BLOCK');
    return true;
  });

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] ${l.type.toUpperCase()}: ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    sounds.playClick();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full space-y-3 font-mono select-none">
      {/* Log Header & Filters */}
      <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>REAL-TIME SYSTEM TELEMETRY</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={handleCopyLogs}
            className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] border border-slate-700 flex items-center gap-1 cursor-pointer"
            title="Copy all telemetry to clipboard"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-cyan-400" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onClearLogs();
            }}
            className="p-1 px-2 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 text-[11px] border border-slate-700 flex items-center gap-1 cursor-pointer"
            title="Clear Log Terminal"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center gap-1.5 text-[11px]">
        {['ALL', 'REROUTE', 'EVAC', 'BLOCK'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-2 py-0.5 rounded transition cursor-pointer ${
              filter === f
                ? 'bg-cyan-950 text-cyan-300 font-bold border border-cyan-800'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {f === 'ALL' ? 'All Telemetry' : f}
          </button>
        ))}
      </div>

      {/* Terminal Output Window */}
      <div
        ref={logContainerRef}
        className="flex-1 bg-black/90 rounded-xl p-3 border border-slate-800 overflow-y-auto space-y-2 text-xs font-mono"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-600 text-center py-8">
            No events logged for current filter criteria.
          </div>
        ) : (
          filteredLogs.map((log) => {
            const isCritical = log.type === 'critical' || log.type === 'block';
            const isReroute = log.type === 'reroute';
            const isSuccess = log.type === 'success' || log.type === 'evac';

            return (
              <div
                key={log.id}
                className={`flex items-start gap-2 text-[11px] p-1.5 rounded border transition-all ${
                  isCritical
                    ? 'bg-red-950/40 text-red-300 border-red-900/60'
                    : isReroute
                    ? 'bg-amber-950/40 text-amber-300 border-amber-900/60'
                    : isSuccess
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-900/60'
                    : 'bg-slate-950 text-slate-300 border-slate-800/80'
                }`}
              >
                {/* Severity Icon */}
                <div className="shrink-0 mt-0.5">
                  {isCritical ? (
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400 animate-pulse" />
                  ) : isReroute ? (
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                  ) : isSuccess ? (
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Info className="w-3.5 h-3.5 text-cyan-400" />
                  )}
                </div>

                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-bold">{log.timestamp}</span>
                    <span
                      className={`text-[9px] uppercase px-1 py-0.2 rounded font-bold ${
                        isCritical
                          ? 'bg-red-900 text-red-200'
                          : isReroute
                          ? 'bg-amber-900 text-amber-200'
                          : isSuccess
                          ? 'bg-emerald-900 text-emerald-200'
                          : 'bg-cyan-950 text-cyan-300'
                      }`}
                    >
                      {log.type}
                    </span>
                  </div>
                  <div className="leading-relaxed">{log.text}</div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

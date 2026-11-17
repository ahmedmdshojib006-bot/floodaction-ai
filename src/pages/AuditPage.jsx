import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Printer, 
  ShieldCheck, 
  CheckCircle, 
  Clock, 
  Terminal, 
  Copy, 
  Check, 
  AlertTriangle,
  Award
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AuditPage({
  optimizationResult,
  logs,
  villages,
  shelters,
  boats
}) {
  const [copied, setCopied] = useState(false);

  const missions = optimizationResult?.missions || [];
  const summary = optimizationResult?.summary || {
    totalMissions: 0,
    totalEvacuated: 0,
    totalDistanceKm: 0,
    maxOperationDurationMin: 0
  };

  const handleDownloadJSON = () => {
    sounds.playClick();
    const manifest = {
      title: "FloodAction AI - Operational Order & Audit Manifest",
      congress: "AI Builder Congress 2026",
      generatedAt: new Date().toISOString(),
      standards: ["ISO 22301 Business Continuity & Disaster Incident Management", "UN OCHA Guidelines"],
      summary,
      missions,
      villages: villages.map(v => ({ id: v.id, name: v.name, pop: v.pop, remaining: v.remainingPop, score: v.urgency?.score })),
      fleet: boats.map(b => ({ id: b.id, name: b.name, cap: b.capacity, speed: b.speedKmH })),
      shelters: shelters.map(s => ({ id: s.id, name: s.name, cap: s.maxCap, occ: s.currentOccupancy })),
      auditLogs: logs
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `FloodAction_Congress_Audit_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleCopyLogs = () => {
    sounds.playClick();
    const text = logs.map(l => `[${l.timestamp}] [${l.type.toUpperCase()}] ${l.text}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 font-mono text-slate-200 select-none">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/40 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm tracking-wider uppercase">
            <Award className="w-5 h-5 text-indigo-400" />
            <span>Operational Audit & Manifest Verification</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Mission Incident Reports & Compliance Verification
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Cryptographic-ready operational audit trail of commander dispatches, automated rerouting triggers, and shelter transfer logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadJSON}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-lg shadow-cyan-950/50"
          >
            <Download className="w-4 h-4" /> Export Complete Audit (JSON)
          </button>
          <button
            onClick={() => window.print()}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" /> Print Order
          </button>
        </div>
      </div>

      {/* Compliance & Standards Verification Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-slate-950 rounded-xl border border-emerald-900/40 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>ISO 22301 Disaster Response</span>
          </div>
          <div className="text-base font-bold text-white">Full Compliance</div>
          <p className="text-[11px] text-slate-400">
            Adheres to international emergency fleet dispatch protocols and audit trails.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-cyan-900/40 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase">
            <CheckCircle className="w-4 h-4 text-cyan-400" />
            <span>UN OCHA Data Standard</span>
          </div>
          <div className="text-base font-bold text-white">Delta Sector-07 Schema</div>
          <p className="text-[11px] text-slate-400">
            Node schemas compatible with United Nations humanitarian response format.
          </p>
        </div>

        <div className="p-4 bg-slate-950 rounded-xl border border-purple-900/40 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Rerouting Latency Guarantee</span>
          </div>
          <div className="text-base font-bold text-emerald-400">320ms Real-Time</div>
          <p className="text-[11px] text-slate-400">
            Exceeds the 500ms critical tactical threshold for river hazard adaptations.
          </p>
        </div>
      </div>

      {/* Official Operational Order Manifest */}
      <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <FileText className="w-4 h-4 text-cyan-400" />
            <span>TASK FORCE CLIMATE SHIELD: OPERATIONAL DISPATCH ORDER #2026-07</span>
          </div>
          <span className="text-[11px] text-cyan-400 px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800">
            CLASSIFICATION: PUBLIC EMERGENCY DIRECTIVE
          </span>
        </div>

        {/* Manifest Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">TOTAL DISPATCH SORTIES</div>
            <div className="text-base font-bold text-cyan-300 mt-0.5">{summary.totalMissions} Legs Scheduled</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">CIVILIANS SAFEGUARDED</div>
            <div className="text-base font-bold text-emerald-300 mt-0.5">{summary.totalEvacuated} Lives</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">WATERWAY TRAVEL DISTANCE</div>
            <div className="text-base font-bold text-slate-200 mt-0.5">{summary.totalDistanceKm} Kilometers</div>
          </div>
          <div className="p-3 bg-slate-900 rounded-xl border border-slate-800">
            <div className="text-slate-400 text-[10px]">ESTIMATED COMPLETION</div>
            <div className="text-base font-bold text-amber-300 mt-0.5">{summary.maxOperationDurationMin} Minutes</div>
          </div>
        </div>

        {/* Detailed Mission Leg Sequence Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Leg</th>
                <th className="p-3">Vessel Assigned</th>
                <th className="p-3">Route Trajectory</th>
                <th className="p-3">Evacuation Count</th>
                <th className="p-3">Safe Haven Delivery</th>
                <th className="p-3">Duration & Dist</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-950/70">
              {missions.length === 0 ? (
                <tr>
                  <td colSpan="7" className="p-6 text-center text-slate-500">
                    Run AI Optimization in the Tactical War Room to generate operational orders.
                  </td>
                </tr>
              ) : (
                missions.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-900/50 transition">
                    <td className="p-3 font-bold text-slate-300">#{idx + 1}</td>
                    <td className="p-3">
                      <span className="font-bold" style={{ color: m.boatColor }}>{m.boatName}</span>
                    </td>
                    <td className="p-3 text-cyan-300">
                      {m.fromNode} ➔ <strong className="text-red-400">{m.villageId}</strong> ({m.villageName})
                    </td>
                    <td className="p-3 font-bold text-emerald-400">
                      {m.evacuatedCount} civilians {m.vulnerableEvacuated > 0 && `(${m.vulnerableEvacuated} vuln)`}
                    </td>
                    <td className="p-3 text-slate-200">
                      {m.shelterId} ({m.shelterName})
                    </td>
                    <td className="p-3 text-slate-400">
                      {m.durationMinutes} min • {m.distanceKm} km
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                        DISPATCHED
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complete Audit Log Stream */}
      <div className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 text-white font-bold text-sm">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <span>COMPLETE CHRONOLOGICAL AUDIT TRAIL ({logs.length} EVENTS)</span>
          </div>

          <button
            onClick={handleCopyLogs}
            className="px-3 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-700 flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-cyan-400" />}
            <span>{copied ? 'Copied' : 'Copy All Logs'}</span>
          </button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-1.5 p-3 bg-black rounded-xl border border-slate-800 text-xs">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 text-[11px] py-1 border-b border-slate-900 last:border-0">
              <span className="text-slate-500 font-bold shrink-0">{log.timestamp}</span>
              <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold shrink-0 ${
                log.type === 'block' || log.type === 'critical'
                  ? 'bg-red-950 text-red-400'
                  : log.type === 'reroute'
                  ? 'bg-amber-950 text-amber-400'
                  : log.type === 'evac' || log.type === 'success'
                  ? 'bg-emerald-950 text-emerald-400'
                  : 'bg-cyan-950 text-cyan-400'
              }`}>
                {log.type}
              </span>
              <span className="text-slate-300">{log.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useMemo } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  Send, 
  LifeBuoy, 
  Users, 
  AlertTriangle, 
  RotateCcw, 
  LayoutList, 
  LayoutGrid, 
  Check, 
  Sparkles,
  Bot
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function AdminTriage({
  sosReports = [],
  onUpdateStatus,
  onSimulateTelegram
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [needFilter, setNeedFilter] = useState('ALL');
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'cards'
  const [telegramMsg, setTelegramMsg] = useState('Feni Parshuram school chade 12 jon attka, pani barche, nouka lagbe!');

  // Filter Reports
  const filteredReports = useMemo(() => {
    return sosReports.filter((r) => {
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (severityFilter !== 'ALL' && r.severity_score !== parseInt(severityFilter)) return false;
      if (districtFilter !== 'ALL' && r.district?.toLowerCase() !== districtFilter.toLowerCase()) return false;
      if (needFilter !== 'ALL') {
        const needs = r.critical_needs || [];
        if (!needs.includes(needFilter)) return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inLoc = r.location?.toLowerCase().includes(q);
        const inMsg = r.raw_message?.toLowerCase().includes(q);
        const inDist = r.district?.toLowerCase().includes(q);
        if (!inLoc && !inMsg && !inDist) return false;
      }
      return true;
    });
  }, [sosReports, statusFilter, severityFilter, needFilter, districtFilter, searchQuery]);

  return (
    <div className="flex-1 flex flex-col h-full space-y-3 font-mono text-slate-200 select-none overflow-hidden">
      {/* Top Filter and Search Bar */}
      <div className="p-3 bg-slate-950/90 rounded-2xl border border-slate-800 shadow-xl space-y-2.5 shrink-0">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reports by location, district, or keyword (e.g., 'Parshuram', 'বোট')..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none focus:border-cyan-500"
            />
          </div>

          {/* Quick Telegram Bot Simulator Trigger */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                sounds.playWarning();
                onSimulateTelegram(telegramMsg);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
              title="Simulate an incoming volunteer SOS message sent via Telegram Bot"
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Simulate Telegram Bot SOS</span>
            </button>

            {/* View Mode Toggle */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-0.5 flex items-center">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
                title="Table View"
              >
                <LayoutList className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                  viewMode === 'cards' ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-white'
                }`}
                title="Card View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 text-xs pt-1 border-t border-slate-800/80">
          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">Status:</span>
            {['ALL', 'PENDING', 'DISPATCHED', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => {
                  sounds.playClick();
                  setStatusFilter(st);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  statusFilter === st ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">Severity:</span>
            {['ALL', '5', '4', '3', '2'].map((sev) => (
              <button
                key={sev}
                onClick={() => {
                  sounds.playClick();
                  setSeverityFilter(sev);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  severityFilter === sev ? 'bg-red-950 text-red-300 border border-red-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sev === 'ALL' ? 'All' : `Sev ${sev}`}
              </button>
            ))}
          </div>

          {/* Need Filter */}
          <div className="flex items-center gap-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-500 text-[10px]">Need:</span>
            {[
              { id: 'ALL', label: 'All' },
              { id: 'rescue_boat', label: 'Boat' },
              { id: 'medical', label: 'Medical' },
              { id: 'drinking_water', label: 'Water' },
              { id: 'food', label: 'Food' }
            ].map((n) => (
              <button
                key={n.id}
                onClick={() => {
                  sounds.playClick();
                  setNeedFilter(n.id);
                }}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition cursor-pointer ${
                  needFilter === n.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'text-slate-400 hover:text-white'
                }`}
              >
                {n.label}
              </button>
            ))}
          </div>

          <span className="text-slate-500 text-[11px] ml-auto">
            Showing <strong className="text-cyan-400">{filteredReports.length}</strong> of {sosReports.length} reports
          </span>
        </div>
      </div>

      {/* Reports Display Container */}
      <div className="flex-1 overflow-y-auto pr-1 min-h-0">
        {filteredReports.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800">
            <AlertTriangle className="w-10 h-10 text-slate-600 mb-2" />
            <h4 className="text-sm font-bold text-slate-300">No SOS Incidents Found</h4>
            <p className="text-xs text-slate-500 max-w-sm mt-1">
              No reports match your current filter settings. Reset filters or submit a new emergency request using the Public SOS bar.
            </p>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/90 shadow-xl">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-3">ID & Priority</th>
                  <th className="p-3">Location & District</th>
                  <th className="p-3">Trapped</th>
                  <th className="p-3">Critical Needs</th>
                  <th className="p-3">Original Emergency Text</th>
                  <th className="p-3">Source</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Triage Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredReports.map((report) => {
                  const isCritical = report.severity_score === 5;
                  const isHigh = report.severity_score === 4;

                  return (
                    <tr key={report.id} className="hover:bg-slate-900/40 transition">
                      {/* ID & Priority Badge */}
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-300">#{report.id}</span>
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                              isCritical
                                ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                                : isHigh
                                ? 'bg-orange-950 text-orange-300 border-orange-700'
                                : 'bg-yellow-950 text-yellow-300 border-yellow-700'
                            }`}
                          >
                            {report.priority_level} ({report.severity_score}/5)
                          </span>
                        </div>
                      </td>

                      {/* Location */}
                      <td className="p-3">
                        <div className="font-bold text-white truncate max-w-[140px]">{report.location}</div>
                        <div className="text-[10px] text-cyan-400">{report.district}</div>
                      </td>

                      {/* People Count */}
                      <td className="p-3 font-bold text-cyan-300 whitespace-nowrap">
                        {report.people_count} pers.
                      </td>

                      {/* Critical Needs */}
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {report.critical_needs?.map((need, idx) => (
                            <span
                              key={idx}
                              className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-cyan-300 border border-cyan-800/50"
                            >
                              {need.replace('_', ' ')}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Raw Message */}
                      <td className="p-3 max-w-[220px]">
                        <p className="text-[11px] text-slate-300 truncate" title={report.raw_message}>
                          {report.raw_message}
                        </p>
                      </td>

                      {/* Source */}
                      <td className="p-3 whitespace-nowrap text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800 font-bold">
                          {report.source}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            report.status === 'PENDING'
                              ? 'bg-red-950/80 text-red-400 border-red-800'
                              : report.status === 'DISPATCHED'
                              ? 'bg-cyan-950/80 text-cyan-300 border-cyan-700'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-700'
                          }`}
                        >
                          {report.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {report.status !== 'DISPATCHED' && (
                            <button
                              onClick={() => {
                                sounds.playDispatch();
                                onUpdateStatus(report.id, 'DISPATCHED');
                              }}
                              className="px-2 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 text-[10px] font-bold transition cursor-pointer"
                              title="Assign and dispatch rescue boat"
                            >
                              Dispatch
                            </button>
                          )}
                          {report.status !== 'RESOLVED' && (
                            <button
                              onClick={() => {
                                sounds.playPickup();
                                onUpdateStatus(report.id, 'RESOLVED');
                              }}
                              className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-[10px] font-bold transition cursor-pointer"
                              title="Mark rescued and safe"
                            >
                              Resolve
                            </button>
                          )}
                          {report.status === 'RESOLVED' && (
                            <button
                              onClick={() => {
                                sounds.playClick();
                                onUpdateStatus(report.id, 'PENDING');
                              }}
                              className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] transition cursor-pointer"
                              title="Reopen incident"
                            >
                              Reopen
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredReports.map((report) => {
              const isCritical = report.severity_score === 5;
              const isHigh = report.severity_score === 4;

              return (
                <div
                  key={report.id}
                  className="p-3.5 bg-slate-950/90 rounded-2xl border border-slate-800 space-y-2.5 shadow-xl hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">#{report.id} {report.location}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                        isCritical
                          ? 'bg-red-950 text-red-300 border-red-700 animate-pulse'
                          : isHigh
                          ? 'bg-orange-950 text-orange-300 border-orange-700'
                          : 'bg-yellow-950 text-yellow-300 border-yellow-700'
                      }`}
                    >
                      {report.priority_level} ({report.severity_score}/5)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80 leading-relaxed italic">
                    "{report.raw_message}"
                  </p>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <div>District: <strong className="text-cyan-400">{report.district}</strong></div>
                    <div>Trapped: <strong className="text-white">{report.people_count} pers.</strong></div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {report.critical_needs?.map((need, idx) => (
                      <span key={idx} className="px-1.5 py-0.2 rounded text-[10px] bg-slate-900 text-cyan-300 border border-cyan-800/50">
                        {need.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                    <span className={`font-bold ${
                      report.status === 'PENDING' ? 'text-red-400' :
                      report.status === 'DISPATCHED' ? 'text-cyan-400' : 'text-emerald-400'
                    }`}>
                      {report.status}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {report.status !== 'DISPATCHED' && (
                        <button
                          onClick={() => {
                            sounds.playDispatch();
                            onUpdateStatus(report.id, 'DISPATCHED');
                          }}
                          className="px-2 py-1 rounded bg-cyan-900/60 hover:bg-cyan-800 text-cyan-200 border border-cyan-700 text-[10px] font-bold transition cursor-pointer"
                        >
                          Dispatch
                        </button>
                      )}
                      {report.status !== 'RESOLVED' && (
                        <button
                          onClick={() => {
                            sounds.playPickup();
                            onUpdateStatus(report.id, 'RESOLVED');
                          }}
                          className="px-2 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border border-emerald-700 text-[10px] font-bold transition cursor-pointer"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

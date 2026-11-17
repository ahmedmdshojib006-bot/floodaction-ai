import React, { useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, LayersControl, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { 
  AlertTriangle, 
  Layers, 
  Compass, 
  Users, 
  LifeBuoy, 
  CheckCircle, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Droplets,
  Filter
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

// Helper to create custom color-coded HTML DivIcon for Leaflet markers
function createCustomMarkerIcon(severity, priority, isPending) {
  let bgColor = '#3b82f6'; // Blue
  let borderColor = '#93c5fd';
  let pulseHtml = '';

  if (severity === 5) {
    bgColor = '#ef4444'; // Red (Critical)
    borderColor = '#fca5a5';
    pulseHtml = `<span style="position:absolute; top:-6px; left:-6px; width:44px; height:44px; border-radius:50%; border:2px solid #ef4444; opacity:0.75; animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></span>`;
  } else if (severity === 4) {
    bgColor = '#f97316'; // Orange (High)
    borderColor = '#fdba74';
  } else if (severity === 3) {
    bgColor = '#eab308'; // Yellow (Medium)
    borderColor = '#fef08a';
  }

  const html = `
    <div style="position:relative; display:flex; align-items:center; justify-content:center; width:32px; height:32px;">
      ${severity >= 4 && isPending ? pulseHtml : ''}
      <div style="background-color:${bgColor}; border:2.5px solid ${borderColor}; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; font-weight:bold; font-size:12px; font-family:monospace; box-shadow:0 0 12px rgba(0,0,0,0.6);">
        ${severity}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-leaflet-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
}

export default function CrisisMap({
  sosReports = [],
  floodZones = [],
  onUpdateStatus,
  onSelectReport
}) {
  const [districtFilter, setDistrictFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [showFloodZones, setShowFloodZones] = useState(true);
  const [mapBaseLayer, setMapBaseLayer] = useState('satellite'); // 'satellite' | 'streets'

  // Bangladesh Flood Sector Center (Feni / Comilla / Noakhali centroid)
  const defaultCenter = [23.15, 91.38];
  const defaultZoom = 9;

  // Filter SOS Reports
  const filteredReports = useMemo(() => {
    return sosReports.filter((r) => {
      if (districtFilter !== 'ALL' && r.district?.toLowerCase() !== districtFilter.toLowerCase()) return false;
      if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
      if (severityFilter === 'CRITICAL' && r.severity_score !== 5) return false;
      if (severityFilter === 'HIGH' && r.severity_score !== 4) return false;
      if (severityFilter === 'MEDIUM' && r.severity_score !== 3) return false;
      if (severityFilter === 'LOW' && r.severity_score > 2) return false;
      return true;
    });
  }, [sosReports, districtFilter, statusFilter, severityFilter]);

  return (
    <div className="relative w-full h-full bg-[#070b14] rounded-2xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl select-none">
      {/* Top Filter and Telemetry Strip */}
      <div className="absolute top-3 left-3 z-[1000] flex flex-wrap items-center gap-2 max-w-[calc(100%-120px)]">
        {/* District Filter */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-xl">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <select
            value={districtFilter}
            onChange={(e) => {
              sounds.playClick();
              setDistrictFilter(e.target.value);
            }}
            className="bg-transparent text-xs font-mono text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">All Flood Districts</option>
            <option value="Feni" className="bg-slate-900 text-slate-200">Feni Basin</option>
            <option value="Noakhali" className="bg-slate-900 text-slate-200">Noakhali Delta</option>
            <option value="Comilla" className="bg-slate-900 text-slate-200">Comilla Gomti</option>
            <option value="Sylhet" className="bg-slate-900 text-slate-200">Sylhet Lowlands</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-xl">
          <Filter className="w-3.5 h-3.5 text-amber-400" />
          <select
            value={statusFilter}
            onChange={(e) => {
              sounds.playClick();
              setStatusFilter(e.target.value);
            }}
            className="bg-transparent text-xs font-mono text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">Status: All</option>
            <option value="PENDING" className="bg-slate-900 text-red-300">Pending Rescue</option>
            <option value="DISPATCHED" className="bg-slate-900 text-cyan-300">Dispatched</option>
            <option value="RESOLVED" className="bg-slate-900 text-emerald-300">Resolved</option>
          </select>
        </div>

        {/* Severity Filter */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 flex items-center gap-2 shadow-xl">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
          <select
            value={severityFilter}
            onChange={(e) => {
              sounds.playClick();
              setSeverityFilter(e.target.value);
            }}
            className="bg-transparent text-xs font-mono text-slate-200 outline-none cursor-pointer"
          >
            <option value="ALL" className="bg-slate-900 text-slate-200">Severity: All</option>
            <option value="CRITICAL" className="bg-slate-900 text-red-400">Sev 5: Critical</option>
            <option value="HIGH" className="bg-slate-900 text-orange-400">Sev 4: High</option>
            <option value="MEDIUM" className="bg-slate-900 text-yellow-400">Sev 3: Medium</option>
            <option value="LOW" className="bg-slate-900 text-blue-400">Sev 1-2: Low</option>
          </select>
        </div>

        {/* Map Base Layer Switcher (100% Free, No Watermark) */}
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl px-2.5 py-1.5 flex items-center gap-1.5 shadow-xl text-xs">
          <button
            onClick={() => {
              sounds.playClick();
              setMapBaseLayer('satellite');
            }}
            className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
              mapBaseLayer === 'satellite'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => {
              sounds.playClick();
              setMapBaseLayer('streets');
            }}
            className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
              mapBaseLayer === 'streets'
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Streets (OSM)
          </button>
        </div>

        {/* ML Flood Risk Zones Layer Toggle */}
        <button
          onClick={() => {
            sounds.playClick();
            setShowFloodZones(!showFloodZones);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition cursor-pointer shadow-xl ${
            showFloodZones
              ? 'bg-cyan-950/90 text-cyan-300 border-cyan-500/80'
              : 'bg-slate-900/90 text-slate-400 border-slate-700'
          }`}
          title="Toggle ML Hydrological Flood Risk Inundation Polygons"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>ML Flood Zones: {showFloodZones ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* Floating Legend */}
      <div className="absolute bottom-4 right-4 z-[1000] bg-slate-950/95 backdrop-blur-md border border-slate-800 rounded-xl p-3 text-xs font-mono space-y-1.5 shadow-2xl hidden sm:block text-slate-300">
        <div className="font-bold text-[11px] text-cyan-400 uppercase tracking-wider pb-1 border-b border-slate-800 flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5" /> Crisis Severity Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-red-300" />
          <span>Sev 5: Life-Threatening / Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500 border border-orange-300" />
          <span>Sev 4: Submerged / High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-yellow-500 border border-yellow-300" />
          <span>Sev 3: Standard Trapped / Medium</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 border border-blue-300" />
          <span>Sev 1-2: Low Risk Support</span>
        </div>
        <div className="pt-1.5 border-t border-slate-800 flex items-center gap-2 text-[10px] text-slate-400">
          <span className="w-3 h-3 rounded-full border border-red-500 bg-red-950/60 inline-block" />
          <span>ML Inundation Risk Zone</span>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="w-full h-full flex-1">
        <MapContainer
          center={defaultCenter}
          zoom={defaultZoom}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%', background: '#070b14' }}
        >
          {/* Free High-Resolution Tile Layers with Dynamic Place Names & Road Labels */}
          {mapBaseLayer === 'satellite' ? (
            <>
              {/* Satellite Imagery Base Layer */}
              <TileLayer
                attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {/* Hybrid Road Network Overlay */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
              {/* Dynamic Place Names, Cities, Upazilas & Boundaries Label Layer */}
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                maxZoom={19}
              />
            </>
          ) : (
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
          )}

          {/* 1. ML Flood Risk Zones Layer */}
          {showFloodZones &&
            floodZones.map((zone) => {
              const isSevere = zone.flood_risk_level === 'SEVERE';
              const color = isSevere ? '#ef4444' : zone.flood_risk_level === 'MODERATE' ? '#f59e0b' : '#38bdf8';
              
              return (
                <Circle
                  key={`zone-${zone.id}`}
                  center={[zone.lat, zone.lng]}
                  radius={zone.radius_km * 1000}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: isSevere ? 0.22 : 0.14,
                    weight: 2,
                    dashArray: isSevere ? '6 4' : undefined
                  }}
                >
                  <Tooltip direction="top" opacity={0.9} sticky>
                    <div className="font-mono text-xs p-1">
                      <strong className="text-white">{zone.zone_name}</strong>
                      <div className="text-cyan-400">Risk: {zone.flood_risk_level} ({zone.risk_score}%)</div>
                      <div>Inundation: ~{zone.predicted_inundation_hours}h</div>
                    </div>
                  </Tooltip>
                  <Popup>
                    <div className="font-mono text-xs text-slate-800 space-y-1.5 p-1 max-w-xs">
                      <div className="font-bold text-sm text-slate-900 border-b pb-1">
                        🌊 {zone.zone_name}
                      </div>
                      <div><strong>District:</strong> {zone.district}</div>
                      <div><strong>ML Flood Risk:</strong> <span className={isSevere ? 'text-red-600 font-bold' : 'text-amber-600 font-bold'}>{zone.flood_risk_level} ({zone.risk_score} pts)</span></div>
                      <div><strong>Predicted Inundation Window:</strong> {zone.predicted_inundation_hours} Hours</div>
                      <div><strong>Rainfall (48h):</strong> {zone.upstream_rainfall_48h_mm} mm</div>
                      <div><strong>River Level:</strong> {zone.river_water_level_m}m (Threshold: {zone.danger_level_threshold_m}m)</div>
                      <div className="text-[11px] text-slate-600 pt-1">
                        Hydrological ML forecast based on elevation ({zone.elevation_m}m) & river gauge telemetry.
                      </div>
                    </div>
                  </Popup>
                </Circle>
              );
            })}

          {/* 2. Interactive SOS Incidents Layer */}
          {filteredReports.map((report) => {
            const isPending = report.status === 'PENDING';
            const icon = createCustomMarkerIcon(report.severity_score, report.priority_level, isPending);

            return (
              <Marker
                key={`sos-${report.id}`}
                position={[report.lat, report.lng]}
                icon={icon}
              >
                {/* Instant Place Name Tooltip on Zoom & Hover */}
                <Tooltip direction="top" offset={[0, -18]} opacity={0.95}>
                  <div className="font-mono text-xs font-bold text-slate-900 px-1 py-0.5">
                    📍 {report.location} <span className="text-red-600">({report.people_count} জন)</span>
                  </div>
                </Tooltip>

                <Popup>
                  <div className="font-mono text-xs text-slate-900 space-y-2 p-1 min-w-[240px]">
                    <div className="flex items-center justify-between border-b pb-1">
                      <span className="font-bold text-sm text-red-600 flex items-center gap-1">
                        <AlertTriangle className="w-4 h-4" /> #{report.id} {report.location}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-200 font-bold uppercase">
                        {report.source}
                      </span>
                    </div>

                    <div className="bg-slate-100 p-2 rounded text-[11px] italic text-slate-700 leading-snug">
                      "{report.raw_message}"
                    </div>

                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <div><strong>Trapped:</strong> {report.people_count} civilians</div>
                      <div><strong>Severity:</strong> {report.severity_score}/5 ({report.priority_level})</div>
                      <div><strong>District:</strong> {report.district}</div>
                      <div>
                        <strong>Status:</strong>{' '}
                        <span className={`font-bold ${
                          report.status === 'PENDING' ? 'text-red-600' :
                          report.status === 'DISPATCHED' ? 'text-cyan-700' : 'text-emerald-700'
                        }`}>
                          {report.status}
                        </span>
                      </div>
                    </div>

                    {/* Needs pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {report.critical_needs?.map((need, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold">
                          {need.replace('_', ' ')}
                        </span>
                      ))}
                    </div>

                    {/* Quick Triage Actions inside popup */}
                    <div className="flex items-center gap-1.5 pt-2 border-t">
                      {report.status !== 'DISPATCHED' && (
                        <button
                          onClick={() => {
                            sounds.playDispatch();
                            onUpdateStatus(report.id, 'DISPATCHED');
                          }}
                          className="flex-1 py-1 rounded bg-cyan-700 hover:bg-cyan-800 text-white font-bold text-[10px] transition cursor-pointer"
                        >
                          Dispatch Team
                        </button>
                      )}
                      {report.status !== 'RESOLVED' && (
                        <button
                          onClick={() => {
                            sounds.playPickup();
                            onUpdateStatus(report.id, 'RESOLVED');
                          }}
                          className="flex-1 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-[10px] transition cursor-pointer"
                        >
                          Mark Rescued
                        </button>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}

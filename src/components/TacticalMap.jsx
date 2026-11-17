import React, { useState } from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  Anchor, 
  Compass, 
  Layers, 
  RefreshCw, 
  Zap, 
  MapPin, 
  Navigation,
  Info
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function TacticalMap({
  nodesMap,
  channels,
  villages,
  shelters,
  baseStation,
  boats,
  boatPositions, // live coordinates of boats { [boatId]: { x, y, heading, status, currentLoad, activeLeg } }
  activeMissionLegs,
  onToggleChannelBlockage,
  onSelectNode,
  selectedNodeId,
  isSimulating,
  blockedAlert
}) {
  const [hoveredChannel, setHoveredChannel] = useState(null);
  const [showFlowAnimation, setShowFlowAnimation] = useState(true);

  // Helper to get node position by ID
  const getNode = (id) => nodesMap[id] || { x: 0, y: 0, name: id };

  const blockedChannelsCount = channels.filter(c => c.isBlocked).length;

  return (
    <div className="relative w-full h-full bg-[#070b14] rounded-xl border border-slate-800 overflow-hidden flex flex-col shadow-2xl select-none">
      {/* Tactical Map Overlay Bar */}
      <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-2">
        <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-lg px-3 py-1.5 flex items-center gap-3 shadow-lg">
          <div className="flex items-center gap-1.5 text-xs font-mono text-cyan-400">
            <Compass className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span className="font-semibold">FENI-SYLHET DELTA COMMAND</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="text-[11px] font-mono text-slate-300">
            Channels: <span className="text-cyan-400">{channels.length}</span> (
            <span className={blockedChannelsCount > 0 ? 'text-red-400 font-bold' : 'text-emerald-400'}>
              {blockedChannelsCount} Blocked
            </span>)
          </div>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setShowFlowAnimation(!showFlowAnimation)}
            className={`text-[10px] font-mono px-2 py-0.5 rounded border transition cursor-pointer ${
              showFlowAnimation
                ? 'bg-cyan-950 text-cyan-300 border-cyan-800'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            {showFlowAnimation ? 'Flow: ON' : 'Flow: OFF'}
          </button>
        </div>

        {/* Dynamic Alert Banner when a route blockage happens */}
        {blockedAlert && (
          <div className="bg-red-950/90 backdrop-blur-md border border-red-500/80 text-red-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-mono shadow-xl animate-bounce">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span className="font-bold">{blockedAlert}</span>
          </div>
        )}
      </div>

      {/* Quick Blockage Scenario Shortcut Bar */}
      <div className="absolute bottom-3 left-3 z-20 hidden md:flex items-center gap-2 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-1.5 shadow-xl">
        <span className="text-[10px] font-mono uppercase text-slate-400 px-2 flex items-center gap-1">
          <Zap className="w-3 h-3 text-amber-400" /> Route Hazard Toggles:
        </span>
        {[
          { id: 'BASE-V4', label: 'Base ⇄ Gowainghat (V4)' },
          { id: 'V1-S1', label: 'Parshuram (V1) ⇄ School' },
          { id: 'V3-S1', label: 'Fulgazi (V3) ⇄ School' },
          { id: 'V3-V4', label: 'Fulgazi ⇄ Gowainghat' }
        ].map((btn) => {
          const ch = channels.find(c => c.id === btn.id);
          const isBlocked = ch ? ch.isBlocked : false;
          return (
            <button
              key={btn.id}
              onClick={() => onToggleChannelBlockage(btn.id)}
              className={`text-[11px] font-mono px-2.5 py-1 rounded transition border cursor-pointer ${
                isBlocked
                  ? 'bg-red-950/90 text-red-300 border-red-600 font-bold shadow-sm shadow-red-900/50'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={`Click to ${isBlocked ? 'unblock' : 'block'} ${btn.label}`}
            >
              {btn.label} {isBlocked ? '⚠️ BLOCKED' : '✓ Open'}
            </button>
          );
        })}
      </div>

      {/* Map Legend */}
      <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-lg p-2.5 text-[11px] font-mono shadow-xl text-slate-300 space-y-1.5 hidden sm:block">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-1 flex items-center gap-1">
          <Layers className="w-3 h-3 text-cyan-400" /> Tactical Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500 border border-red-300 animate-ping inline-block" />
          <span className="w-3 h-3 rounded-full bg-red-500 inline-block -ml-5" />
          <span>High Urgency (&gt;70)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
          <span>Medium Urgency (40-70)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
          <span>Low Urgency (&lt;40)</span>
        </div>
        <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="w-4 h-1 bg-cyan-400 rounded inline-block" />
          <span>Clear Water Channel</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-1.5 bg-red-500 border border-dashed border-red-300 inline-block" />
          <span className="text-red-400">Blocked / Debris</span>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-full flex-1">
        <svg
          viewBox="0 0 1000 650"
          className="w-full h-full tactical-grid tactical-topo cursor-crosshair"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Water Linear Gradients */}
            <linearGradient id="waterFlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="activeMissionGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.95" />
            </linearGradient>

            {/* Blocked Hazard Pattern */}
            <pattern id="blockedPattern" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="8" height="16" fill="#7f1d1d" />
              <rect x="8" width="8" height="16" fill="#ef4444" />
            </pattern>

            {/* Glow Filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Critical Pulse Filter */}
            <filter id="pulseGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Ambient River Flood Plain Contour / Delta Estuary Shapes */}
          <path
            d="M 120 160 Q 300 240 470 310 T 780 480 Q 860 380 750 200 Q 560 140 370 110 Z"
            fill="#0b172b"
            fillOpacity="0.45"
            stroke="#1e293b"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* 1. RENDER RIVER CHANNELS (EDGES) */}
          <g id="river-channels">
            {channels.map((ch) => {
              const from = getNode(ch.from);
              const to = getNode(ch.to);
              const midX = (from.x + to.x) / 2;
              const midY = (from.y + to.y) / 2;
              const isHovered = hoveredChannel === ch.id;

              // Check if this channel is part of an active mission leg
              const isActiveInMission = activeMissionLegs && activeMissionLegs.some(leg => 
                (leg.pickupRoute?.channelsTraversed?.includes(ch.id)) ||
                (leg.dropoffRoute?.channelsTraversed?.includes(ch.id))
              );

              return (
                <g 
                  key={ch.id} 
                  className="cursor-pointer transition-all duration-300"
                  onMouseEnter={() => setHoveredChannel(ch.id)}
                  onMouseLeave={() => setHoveredChannel(null)}
                  onClick={() => {
                    sounds.playWarning();
                    onToggleChannelBlockage(ch.id);
                  }}
                >
                  {/* Outer glow line for active or hovered channel */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={ch.isBlocked ? '#ef4444' : isActiveInMission ? '#f59e0b' : '#38bdf8'}
                    strokeWidth={isHovered ? 14 : ch.isBlocked ? 10 : isActiveInMission ? 9 : 7}
                    strokeOpacity={isHovered ? 0.4 : ch.isBlocked ? 0.3 : isActiveInMission ? 0.35 : 0.2}
                    strokeLinecap="round"
                  />

                  {/* Base Channel Water Line */}
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={ch.isBlocked ? '#991b1b' : isActiveInMission ? '#f59e0b' : '#0284c7'}
                    strokeWidth={ch.isBlocked ? 5 : isActiveInMission ? 5 : 4}
                    strokeLinecap="round"
                    strokeDasharray={ch.isBlocked ? '6 6' : undefined}
                  />

                  {/* Flow Animation Overlay Line */}
                  {!ch.isBlocked && showFlowAnimation && (
                    <line
                      x1={from.x}
                      y1={from.y}
                      x2={to.x}
                      y2={to.y}
                      stroke={isActiveInMission ? '#fef08a' : '#7dd3fc'}
                      strokeWidth={2}
                      strokeDasharray="8 16"
                      strokeLinecap="round"
                      className="animate-river-flow"
                    />
                  )}

                  {/* Channel Distance / Blockage Indicator Pill in the Middle */}
                  <g transform={`translate(${midX}, ${midY})`}>
                    {ch.isBlocked ? (
                      <g className="animate-pulse">
                        <rect
                          x="-42"
                          y="-13"
                          width="84"
                          height="26"
                          rx="13"
                          fill="#7f1d1d"
                          stroke="#ef4444"
                          strokeWidth="2"
                        />
                        <text
                          x="0"
                          y="4"
                          textAnchor="middle"
                          fill="#ffffff"
                          fontSize="10"
                          fontFamily="monospace"
                          fontWeight="bold"
                        >
                          ⛔ BLOCKED
                        </text>
                      </g>
                    ) : (
                      <g className="transition-all hover:scale-110">
                        <rect
                          x="-26"
                          y="-9"
                          width="52"
                          height="18"
                          rx="9"
                          fill="#0f172a"
                          fillOpacity="0.85"
                          stroke={isHovered ? '#38bdf8' : '#334155'}
                          strokeWidth="1.2"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fill={isHovered ? '#38bdf8' : '#94a3b8'}
                          fontSize="9"
                          fontFamily="monospace"
                        >
                          {ch.distanceKm} km
                        </text>
                      </g>
                    )}
                  </g>
                </g>
              );
            })}
          </g>

          {/* 2. RENDER BASE STATION (COMMAND POST) */}
          <g 
            id="node-base"
            transform={`translate(${baseStation.x}, ${baseStation.y})`}
            className="cursor-pointer group"
            onClick={() => onSelectNode(baseStation.id)}
          >
            {/* Radar concentric rings */}
            <circle r="36" fill="none" stroke="#06b6d4" strokeWidth="1" strokeOpacity="0.2" strokeDasharray="3 3" />
            <circle r="26" fill="none" stroke="#06b6d4" strokeWidth="1.2" strokeOpacity="0.4" />

            {/* Base Hub Shape */}
            <circle r="18" fill="#082f49" stroke="#38bdf8" strokeWidth="2.5" filter="url(#glow)" />
            <Anchor className="w-5 h-5 text-cyan-300" x="-10" y="-10" />

            {/* Label */}
            <g transform="translate(0, 32)">
              <rect x="-70" y="-10" width="140" height="20" rx="4" fill="#082f49" stroke="#0284c7" strokeWidth="1" />
              <text x="0" y="4" textAnchor="middle" fill="#38bdf8" fontSize="10" fontFamily="monospace" fontWeight="bold">
                FENI COMMAND BASE
              </text>
            </g>
          </g>

          {/* 3. RENDER SHELTERS (S1, S2) */}
          {shelters.map((s) => {
            const isSelected = selectedNodeId === s.id;
            const occupancyPct = Math.round((s.currentOccupancy / s.maxCap) * 100);
            const isNearFull = occupancyPct >= 85;

            return (
              <g
                key={s.id}
                transform={`translate(${s.x}, ${s.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectNode(s.id)}
              >
                {/* Shelter boundary halo */}
                <circle
                  r="30"
                  fill="none"
                  stroke={isNearFull ? '#f59e0b' : '#10b981'}
                  strokeWidth="1.5"
                  strokeOpacity={isSelected ? 0.9 : 0.3}
                  strokeDasharray="4 3"
                />

                {/* Main Shelter Hex/Circle */}
                <circle
                  r="19"
                  fill="#064e3b"
                  stroke={isSelected ? '#34d399' : '#10b981'}
                  strokeWidth={isSelected ? 3 : 2}
                  filter="url(#glow)"
                />
                <ShieldCheck className="w-5 h-5 text-emerald-300" x="-10" y="-10" />

                {/* Shelter Tag & Live Capacity Bar */}
                <g transform="translate(0, 30)">
                  <rect
                    x="-65"
                    y="-12"
                    width="130"
                    height="32"
                    rx="5"
                    fill="#064e3b"
                    fillOpacity="0.9"
                    stroke="#059669"
                    strokeWidth="1.2"
                  />
                  <text x="0" y="0" textAnchor="middle" fill="#a7f3d0" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    {s.id}: {s.currentOccupancy}/{s.maxCap} Beds
                  </text>
                  {/* Capacity mini bar */}
                  <rect x="-55" y="6" width="110" height="6" rx="3" fill="#042f2e" />
                  <rect
                    x="-55"
                    y="6"
                    width={(occupancyPct / 100) * 110}
                    height="6"
                    rx="3"
                    fill={isNearFull ? '#f59e0b' : '#10b981'}
                  />
                </g>
              </g>
            );
          })}

          {/* 4. RENDER MAROONED VILLAGES (V1 to V5) */}
          {villages.map((v) => {
            const urgency = v.urgency || { score: 50, badge: 'Medium', badgeColor: 'amber' };
            const isHigh = urgency.badge === 'High';
            const isMedium = urgency.badge === 'Medium';
            const isSelected = selectedNodeId === v.id;
            const isCleared = v.remainingPop <= 0;

            const ringColor = isCleared ? '#64748b' : isHigh ? '#ef4444' : isMedium ? '#f59e0b' : '#10b981';

            return (
              <g
                key={v.id}
                transform={`translate(${v.x}, ${v.y})`}
                className="cursor-pointer group"
                onClick={() => onSelectNode(v.id)}
              >
                {/* Critical Radar Pulse if High Urgency and not cleared */}
                {isHigh && !isCleared && (
                  <circle
                    r="34"
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="2"
                    className="animate-pulse-ring"
                    filter="url(#pulseGlow)"
                  />
                )}

                {/* Outer Node Halo */}
                <circle
                  r="24"
                  fill={isCleared ? '#1e293b' : isHigh ? '#450a0a' : isMedium ? '#451a03' : '#064e3b'}
                  fillOpacity="0.9"
                  stroke={ringColor}
                  strokeWidth={isSelected ? 3 : 2}
                  filter={isHigh ? 'url(#glow)' : undefined}
                />

                {/* Center Node Symbol / ID */}
                <text
                  x="0"
                  y="4"
                  textAnchor="middle"
                  fill={ringColor}
                  fontSize="12"
                  fontFamily="monospace"
                  fontWeight="bold"
                >
                  {v.id}
                </text>

                {/* Medical Emergency Badge if active */}
                {v.medicalEmergency && !isCleared && (
                  <g transform="translate(14, -14)">
                    <circle r="8" fill="#ef4444" stroke="#ffffff" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#ffffff" fontSize="9" fontWeight="bold">
                      +
                    </text>
                  </g>
                )}

                {/* Village Info Card */}
                <g transform="translate(0, 36)">
                  <rect
                    x="-65"
                    y="-12"
                    width="130"
                    height="38"
                    rx="6"
                    fill="#090e17"
                    fillOpacity="0.95"
                    stroke={isSelected ? '#38bdf8' : ringColor}
                    strokeWidth={isSelected ? 1.8 : 1}
                  />
                  {/* Village Name & Urgency Score */}
                  <text x="-58" y="2" fill="#f8fafc" fontSize="10" fontFamily="monospace" fontWeight="bold">
                    {v.name}
                  </text>
                  <text
                    x="58"
                    y="2"
                    textAnchor="end"
                    fill={ringColor}
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {isCleared ? 'CLEARED' : `${urgency.score}pts`}
                  </text>

                  {/* Pop Count and Water Rise */}
                  <text x="-58" y="18" fill="#94a3b8" fontSize="9" fontFamily="monospace">
                    Pop: <tspan fill={isCleared ? '#64748b' : '#f87171'} fontWeight="bold">{v.remainingPop}/{v.pop}</tspan>
                  </text>
                  <text x="58" y="18" textAnchor="end" fill="#38bdf8" fontSize="9" fontFamily="monospace">
                    +{v.waterRiseCmH}cm/h
                  </text>
                </g>
              </g>
            );
          })}

          {/* 5. LIVE ANIMATED BOATS ON MAP */}
          {boats.map((b) => {
            const pos = boatPositions[b.id] || {
              x: baseStation.x,
              y: baseStation.y,
              heading: 0,
              status: 'At Base',
              currentLoad: 0
            };

            return (
              <g
                key={b.id}
                transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.heading || 0})`}
                className="transition-all duration-100 ease-linear pointer-events-none"
              >
                {/* Vessel Radar Pulse */}
                <circle
                  r="16"
                  fill={b.color}
                  fillOpacity="0.25"
                  stroke={b.color}
                  strokeWidth="1.5"
                  className="animate-ping"
                />

                {/* Vessel Tactical Chevron Hull */}
                <path
                  d="M 0 -14 L 10 10 L 0 6 L -10 10 Z"
                  fill={b.color}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                  filter="url(#glow)"
                />

                {/* Unrotated Vessel Telemetry Tag */}
                <g transform={`rotate(${-pos.heading || 0}) translate(0, -22)`}>
                  <rect
                    x="-42"
                    y="-10"
                    width="84"
                    height="18"
                    rx="4"
                    fill="#020617"
                    fillOpacity="0.9"
                    stroke={b.color}
                    strokeWidth="1"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="9"
                    fontFamily="monospace"
                    fontWeight="bold"
                  >
                    {b.shortName}: {pos.currentLoad || 0}/{b.capacity}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom Status / Instructions Bar */}
      <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400" />
          <span>Click any river segment to toggle <strong className="text-red-400">BLOCKED</strong> status • Click nodes to view telemetry</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" /> Boat 1 (Carrier: 10 cap)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Boat 2 (Scout: 6 cap)
          </span>
        </div>
      </div>
    </div>
  );
}

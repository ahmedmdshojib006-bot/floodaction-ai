import React, { useState } from 'react';
import { 
  Ship, 
  Home, 
  Fuel, 
  Gauge, 
  ShieldCheck, 
  Plus, 
  LifeBuoy, 
  Activity, 
  MapPin, 
  Zap, 
  HeartHandshake, 
  Layers, 
  Clock 
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';

export default function LogisticsPage({
  boats,
  shelters,
  onExpandShelterCapacity
}) {
  const [fuelLevels, setFuelLevels] = useState({
    'boat-1': 88,
    'boat-2': 94
  });

  const handleRefuel = (boatId) => {
    sounds.playClick();
    setFuelLevels(prev => ({ ...prev, [boatId]: 100 }));
  };

  return (
    <div className="flex-1 p-4 lg:p-6 overflow-y-auto space-y-6 font-mono text-slate-200 select-none">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-950 via-slate-900 to-cyan-950/40 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wider uppercase">
            <Ship className="w-5 h-5 text-cyan-400" />
            <span>Tactical Resource & Safe Haven Logistics</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">
            Fleet Asset Readiness & Shelter Saturation Control
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">
            Live telemetry for emergency rescue boats, fuel reserves, medical shelter inventory, and real-time bed capacity headroom.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400">TOTAL FLEET CAPACITY</div>
            <div className="text-base font-bold text-cyan-400">16 civilians / trip</div>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-right">
            <div className="text-[10px] text-slate-400">TOTAL SHELTER BEDS</div>
            <div className="text-base font-bold text-emerald-400">
              {shelters.reduce((acc, s) => acc + s.maxCap, 0)} spaces
            </div>
          </div>
        </div>
      </div>

      {/* 1. FLEET ASSETS SECTION */}
      <div className="space-y-3">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
          <Ship className="w-4 h-4 text-cyan-400" />
          <span>Active Vessel Specifications & Telemetry</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {boats.map((b) => {
            const fuel = fuelLevels[b.id] || 90;
            const isCarrier = b.id === 'boat-1';

            return (
              <div
                key={b.id}
                className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 shadow-lg hover:border-slate-700 transition"
              >
                {/* Vessel Title & Status */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: `${b.color}25`, border: `1.5px solid ${b.color}` }}
                    >
                      <Ship className="w-5 h-5" style={{ color: b.color }} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-mono">{b.name}</h3>
                      <span className="text-[11px] text-slate-400">{b.type}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {b.status}
                  </span>
                </div>

                {/* Technical Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Evacuation Cap</div>
                    <div className="text-sm font-bold text-cyan-300 mt-0.5">{b.capacity} pers.</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Cruising Speed</div>
                    <div className="text-sm font-bold text-emerald-300 mt-0.5">{b.speedKmH} km/h</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Total Rescued</div>
                    <div className="text-sm font-bold text-amber-300 mt-0.5">{b.totalRescued} pers.</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800/80">
                    <div className="text-[10px] text-slate-400">Hull Integrity</div>
                    <div className="text-sm font-bold text-emerald-400 mt-0.5">100% Ready</div>
                  </div>
                </div>

                {/* Fuel & Battery Status */}
                <div className="space-y-1.5 p-3 bg-slate-900/60 rounded-xl border border-slate-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Fuel className="w-3.5 h-3.5 text-amber-400" /> Marine Fuel Reserve
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-amber-300">{fuel}%</span>
                      {fuel < 100 && (
                        <button
                          onClick={() => handleRefuel(b.id)}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 cursor-pointer"
                        >
                          Refuel
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full"
                      style={{ width: `${fuel}%` }}
                    />
                  </div>
                </div>

                {/* Specialized Equipment */}
                <div className="text-[11px] text-slate-400 flex flex-wrap gap-2">
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    ✓ VHF Marine Radio 156.8MHz
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    ✓ {isCarrier ? '25 Infant/Adult PFD Life Jackets' : 'Emergency Trauma Kit'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                    ✓ {isCarrier ? 'Twin-Chine Fiberglass Hull' : 'Lightweight Hydroplane Aluminum'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. SAFE HAVEN SHELTERS SECTION */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Home className="w-4 h-4 text-emerald-400" />
            <span>Safe Haven Shelters Capacity & Logistics</span>
          </div>

          <span className="text-[11px] text-slate-400">
            Current Overall Saturation: <strong className="text-amber-400">
              {Math.round((shelters.reduce((a, s) => a + s.currentOccupancy, 0) / shelters.reduce((a, s) => a + s.maxCap, 0)) * 100)}%
            </strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shelters.map((s) => {
            const availableBeds = Math.max(0, s.maxCap - s.currentOccupancy);
            const occupancyPct = Math.round((s.currentOccupancy / s.maxCap) * 100);

            return (
              <div
                key={s.id}
                className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-4 shadow-lg"
              >
                {/* Shelter Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold">
                      <Home className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-mono">{s.name}</h3>
                      <span className="text-[11px] text-slate-400">{s.type}</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Elev: +{s.elevationM}m
                  </span>
                </div>

                {/* Capacity Gauge */}
                <div className="space-y-1.5 p-3.5 bg-slate-900/80 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-bold">Bed Space Occupancy:</span>
                    <span className="text-slate-200">
                      <strong className="text-amber-400">{s.currentOccupancy}</strong> / {s.maxCap} Beds ({occupancyPct}%)
                    </span>
                  </div>

                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        occupancyPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                    <span>Available Headroom: <strong className="text-emerald-400">{availableBeds} beds</strong></span>
                    <span>Flood Protection: <strong className="text-slate-200">Highland Levee Grade A</strong></span>
                  </div>
                </div>

                {/* Logistics Support Details */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Food Supplies</div>
                    <div className="font-bold text-slate-200 mt-0.5">{s.foodSupplyDays} days emergency rations</div>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-400">Medical Station</div>
                    <div className="font-bold text-emerald-300 mt-0.5">
                      {s.medicalSupport ? '✓ 2 Doctors Active' : 'Basic First Aid'}
                    </div>
                  </div>
                </div>

                {/* Capacity Expansion Button */}
                <div className="pt-1">
                  <button
                    onClick={() => {
                      sounds.playDispatch();
                      onExpandShelterCapacity(s.id, 10);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Simulate setting up emergency refuge relief tents"
                  >
                    <Plus className="w-3.5 h-3.5" /> Deploy Emergency Flood Tents (+10 Beds)
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

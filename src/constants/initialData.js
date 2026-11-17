// Initial Data conforming to Disaster Command Specifications
// Domain: ClimateSphere AI | Track: Climate Shield (Feni & Sylhet Sector)

export const INITIAL_BOATS = [
  {
    id: 'boat-1',
    name: 'Boat 1 (Rescue Carrier)',
    shortName: 'Boat 1',
    type: 'Heavy Evacuation Carrier',
    capacity: 10,
    currentLoad: 0,
    speedKmH: 25,
    status: 'At Base', // 'At Base' | 'En Route' | 'Evacuating' | 'Unloading'
    currentNodeId: 'BASE',
    targetNodeId: null,
    totalRescued: 0,
    color: '#06b6d4', // Neon Cyan
    accentBg: 'rgba(6, 182, 212, 0.15)',
    iconType: 'carrier'
  },
  {
    id: 'boat-2',
    name: 'Boat 2 (Rapid Scout/Relief)',
    shortName: 'Boat 2',
    type: 'High-Speed Rapid Scout',
    capacity: 6,
    currentLoad: 0,
    speedKmH: 35,
    status: 'At Base',
    currentNodeId: 'BASE',
    targetNodeId: null,
    totalRescued: 0,
    color: '#10b981', // Neon Emerald
    accentBg: 'rgba(16, 185, 129, 0.15)',
    iconType: 'rapid'
  }
];

export const INITIAL_SHELTERS = [
  {
    id: 'S1',
    name: 'Shelter S1 (Feni Pilot High School)',
    shortName: 'S1 - Feni Pilot School',
    type: 'Safe Highland Facility (Feni)',
    x: 150,
    y: 170,
    maxCap: 30,
    currentOccupancy: 12,
    elevationM: 14.5,
    medicalSupport: true,
    foodSupplyDays: 5
  },
  {
    id: 'S2',
    name: 'Shelter S2 (Sylhet Govt. College)',
    shortName: 'S2 - Sylhet Govt. College',
    type: 'Highland Flood Refuge (Sylhet)',
    x: 850,
    y: 330,
    maxCap: 20,
    currentOccupancy: 5,
    elevationM: 18.2,
    medicalSupport: true,
    foodSupplyDays: 7
  }
];

export const BASE_STATION = {
  id: 'BASE',
  name: 'Feni Forward Disaster Command & Boat Docks',
  shortName: 'Feni Command Base',
  x: 490,
  y: 560,
  type: 'Central Command Depot',
  dockCount: 4
};

export const INITIAL_VILLAGES = [
  {
    id: 'V1',
    name: 'Parshuram',
    x: 220,
    y: 360,
    pop: 14,
    remainingPop: 14,
    vulnerablePct: 60, // 60%
    waterRiseCmH: 12,
    foodLeftHrs: 6,
    medicalEmergency: true,
    notes: 'Muhuri river embankment breached at Parshuram, Feni'
  },
  {
    id: 'V2',
    name: 'Companiganj',
    x: 770,
    y: 490,
    pop: 22,
    remainingPop: 22,
    vulnerablePct: 30,
    waterRiseCmH: 5,
    foodLeftHrs: 18,
    medicalEmergency: false,
    notes: 'Surma river basin agricultural lowlands, Sylhet'
  },
  {
    id: 'V3',
    name: 'Fulgazi',
    x: 370,
    y: 110,
    pop: 8,
    remainingPop: 8,
    vulnerablePct: 75,
    waterRiseCmH: 15,
    foodLeftHrs: 3,
    medicalEmergency: true,
    notes: 'Flash surge upstream near Muhuri barrage, Fulgazi, Feni'
  },
  {
    id: 'V4',
    name: 'Gowainghat',
    x: 480,
    y: 310,
    pop: 18,
    remainingPop: 18,
    vulnerablePct: 40,
    waterRiseCmH: 8,
    foodLeftHrs: 12,
    medicalEmergency: false,
    notes: 'Piyain-Surma confluence island sandbar submerged, Sylhet'
  },
  {
    id: 'V5',
    name: 'Chhagalnaiya',
    x: 750,
    y: 200,
    pop: 11,
    remainingPop: 11,
    vulnerablePct: 50,
    waterRiseCmH: 10,
    foodLeftHrs: 8,
    medicalEmergency: false,
    notes: 'Shubhapur canal backflow rising near border embankment, Feni'
  }
];

// River Network Graph connecting Base, S1, S2, V1 - V5 in Feni & Sylhet Flood Basin
export const INITIAL_RIVER_CHANNELS = [
  {
    id: 'BASE-V4',
    from: 'BASE',
    to: 'V4',
    distanceKm: 5.5,
    name: 'Feni-Gowainghat Main Waterway',
    isBlocked: false,
    currentSpeedKnots: 4.2
  },
  {
    id: 'BASE-V1',
    from: 'BASE',
    to: 'V1',
    distanceKm: 6.8,
    name: 'Muhuri River Lower Reach',
    isBlocked: false,
    currentSpeedKnots: 3.8
  },
  {
    id: 'BASE-V2',
    from: 'BASE',
    to: 'V2',
    distanceKm: 5.2,
    name: 'Surma River South Reach',
    isBlocked: false,
    currentSpeedKnots: 2.9
  },
  {
    id: 'V1-S1',
    from: 'V1',
    to: 'S1',
    distanceKm: 3.8,
    name: 'Parshuram-Feni Levee Canal',
    isBlocked: false,
    currentSpeedKnots: 2.1
  },
  {
    id: 'V1-V4',
    from: 'V1',
    to: 'V4',
    distanceKm: 4.6,
    name: 'Muhuri-Gowainghat Shallows',
    isBlocked: false,
    currentSpeedKnots: 3.5
  },
  {
    id: 'V1-V3',
    from: 'V1',
    to: 'V3',
    distanceKm: 5.4,
    name: 'Parshuram-Fulgazi Bypass Waterway',
    isBlocked: false,
    currentSpeedKnots: 4.0
  },
  {
    id: 'V3-S1',
    from: 'V3',
    to: 'S1',
    distanceKm: 4.2,
    name: 'Fulgazi-Feni North Levee Feeder',
    isBlocked: false,
    currentSpeedKnots: 5.1
  },
  {
    id: 'V3-V4',
    from: 'V3',
    to: 'V4',
    distanceKm: 4.1,
    name: 'Fulgazi-Gowainghat Upper Channel',
    isBlocked: false,
    currentSpeedKnots: 4.5
  },
  {
    id: 'V3-V5',
    from: 'V3',
    to: 'V5',
    distanceKm: 6.5,
    name: 'Fulgazi-Chhagalnaiya High Waterway',
    isBlocked: false,
    currentSpeedKnots: 3.6
  },
  {
    id: 'V4-V5',
    from: 'V4',
    to: 'V5',
    distanceKm: 5.0,
    name: 'Gowainghat-Chhagalnaiya Branch',
    isBlocked: false,
    currentSpeedKnots: 3.0
  },
  {
    id: 'V4-V2',
    from: 'V4',
    to: 'V2',
    distanceKm: 5.8,
    name: 'Gowainghat-Companiganj Cut',
    isBlocked: false,
    currentSpeedKnots: 2.6
  },
  {
    id: 'V4-S2',
    from: 'V4',
    to: 'S2',
    distanceKm: 6.9,
    name: 'Gowainghat-Sylhet College Channel',
    isBlocked: false,
    currentSpeedKnots: 3.2
  },
  {
    id: 'V5-S2',
    from: 'V5',
    to: 'S2',
    distanceKm: 3.4,
    name: 'Chhagalnaiya-Sylhet Refuge Canal',
    isBlocked: false,
    currentSpeedKnots: 2.4
  },
  {
    id: 'V2-S2',
    from: 'V2',
    to: 'S2',
    distanceKm: 4.5,
    name: 'Companiganj-Sylhet Safe Waterway',
    isBlocked: false,
    currentSpeedKnots: 2.8
  }
];

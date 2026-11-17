// Constrained Vehicle Routing Problem (CVRP) Dispatch Optimizer
// Domain: ClimateSphere AI | Track: Climate Shield

import { findShortestPath, findNearestAvailableShelter, calculateTravelTimeMinutes } from './routingEngine';
import { rankVillagesByUrgency } from './urgencyEngine';

export function runConstrainedDispatchOptimization({
  villages,
  boats,
  shelters,
  channels,
  nodesMap,
  surgeMultiplier = 1.0
}) {
  const logs = [];
  const addLog = (msg) => logs.push(`[CVRP-ENGINE] ${msg}`);

  addLog('Initializing Multi-Trip Constrained Optimization Matrix...');

  // Clone state to simulate without modifying original objects
  const simVillages = villages.map(v => ({
    ...v,
    remaining: v.remainingPop > 0 ? v.remainingPop : v.pop,
    urgency: v.urgency || { score: 50, badge: 'Medium' }
  }));

  const simShelters = shelters.map(s => {
    let availableCap = Math.max(0, s.maxCap - s.currentOccupancy);
    // If shelter is 100% full from previous simulation run, allocate initial baseline headroom
    if (availableCap <= 0) {
      availableCap = s.id === 'S1' ? 18 : 15;
    }
    return {
      ...s,
      availableCap,
      projectedOccupancy: s.maxCap - availableCap
    };
  });

  // Rank villages dynamically by urgency score
  const rankedVillages = rankVillagesByUrgency(simVillages, surgeMultiplier);
  addLog(`Prioritization Queue established: ${rankedVillages.map(v => `${v.id} (${v.urgency.score} pts)`).join(' > ')}`);

  // Initialize fleet state
  const fleet = boats.map(b => ({
    ...b,
    currentLocation: b.currentNodeId || 'BASE',
    availableAtMinutes: 0,
    missions: [], // list of trips
    totalDistanceKm: 0,
    totalEvacuated: 0
  }));

  let totalTrappedRemaining = simVillages.reduce((sum, v) => sum + v.remaining, 0);
  let totalShelterCapacityLeft = simShelters.reduce((sum, s) => sum + s.availableCap, 0);

  addLog(`Active Fleet: ${fleet.length} vessels | Marooned: ${totalTrappedRemaining} | Available Shelter Beds: ${totalShelterCapacityLeft}`);

  let iterations = 0;
  const MAX_ITERATIONS = 25; // Prevent runaway loops

  while (totalTrappedRemaining > 0 && totalShelterCapacityLeft > 0 && iterations < MAX_ITERATIONS) {
    iterations++;

    // Find highest priority village with people remaining that is reachable
    let targetVillage = null;
    let targetBoat = null;
    let bestPickupRoute = null;

    // Sort fleet by earliest available time
    fleet.sort((a, b) => a.availableAtMinutes - b.availableAtMinutes);

    for (const v of rankedVillages) {
      if (v.remaining <= 0) continue;

      // Check which available boat can reach this village
      for (const b of fleet) {
        const route = findShortestPath(b.currentLocation, v.id, channels, nodesMap);
        if (route) {
          targetVillage = v;
          targetBoat = b;
          bestPickupRoute = route;
          break;
        }
      }

      if (targetVillage) break;
    }

    if (!targetVillage || !targetBoat || !bestPickupRoute) {
      addLog('WARNING: Remaining marooned nodes are currently unreachable due to channel blockages!');
      break;
    }

    // Determine number of people to evacuate on this trip
    const pickupCapacity = Math.min(targetBoat.capacity, targetVillage.remaining, totalShelterCapacityLeft);
    if (pickupCapacity <= 0) {
      addLog('Notice: Shelters have reached maximum emergency capacity limits.');
      break;
    }

    // Find nearest shelter with available capacity
    const shelterTarget = findNearestAvailableShelter(
      targetVillage.id,
      simShelters.map(s => ({ ...s, currentOccupancy: s.maxCap - s.availableCap })),
      channels,
      nodesMap,
      1
    );

    if (!shelterTarget) {
      addLog(`CRITICAL: No available shelter found reachable from ${targetVillage.id}`);
      break;
    }

    const dropoffShelter = simShelters.find(s => s.id === shelterTarget.shelter.id);
    const dropoffRoute = shelterTarget.route;
    const actualEvacCount = Math.min(pickupCapacity, dropoffShelter.availableCap);

    if (actualEvacCount <= 0) {
      addLog(`Shelter ${dropoffShelter.id} saturated.`);
      break;
    }

    // Calculate travel times & distances
    const pickupTimeMin = calculateTravelTimeMinutes(bestPickupRoute.distanceKm, targetBoat.speedKmH);
    const embarkTimeMin = 3; // 3 minutes loading time for flood rescue
    const dropoffTimeMin = calculateTravelTimeMinutes(dropoffRoute.distanceKm, targetBoat.speedKmH);
    const disembarkTimeMin = 2; // 2 minutes safe transfer to shelter

    const legStartTime = targetBoat.availableAtMinutes;
    const legArrivalTimeVillage = legStartTime + pickupTimeMin;
    const legDepartureTimeVillage = legArrivalTimeVillage + embarkTimeMin;
    const legArrivalTimeShelter = legDepartureTimeVillage + dropoffTimeMin;
    const legCompletionTime = legArrivalTimeShelter + disembarkTimeMin;

    const tripDistance = parseFloat((bestPickupRoute.distanceKm + dropoffRoute.distanceKm).toFixed(2));

    const missionLeg = {
      tripIndex: targetBoat.missions.length + 1,
      boatId: targetBoat.id,
      boatName: targetBoat.shortName,
      boatColor: targetBoat.color,
      fromNode: targetBoat.currentLocation,
      villageId: targetVillage.id,
      villageName: targetVillage.name,
      shelterId: dropoffShelter.id,
      shelterName: dropoffShelter.name,
      evacuatedCount: actualEvacCount,
      vulnerableEvacuated: Math.round(actualEvacCount * (targetVillage.vulnerablePct / 100)),
      medicalEmergencyResolved: targetVillage.medicalEmergency && actualEvacCount >= targetVillage.remaining,
      pickupRoute: bestPickupRoute,
      dropoffRoute: dropoffRoute,
      combinedPath: [...bestPickupRoute.path, ...dropoffRoute.path.slice(1)],
      distanceKm: tripDistance,
      startTimeMin: legStartTime,
      arrivalTimeVillageMin: legArrivalTimeVillage,
      departureTimeVillageMin: legDepartureTimeVillage,
      arrivalTimeShelterMin: legArrivalTimeShelter,
      completionTimeMin: legCompletionTime,
      durationMinutes: legCompletionTime - legStartTime,
      urgencyScore: targetVillage.urgency.score
    };

    targetBoat.missions.push(missionLeg);
    targetBoat.totalDistanceKm += tripDistance;
    targetBoat.totalEvacuated += actualEvacCount;
    targetBoat.availableAtMinutes = legCompletionTime;
    targetBoat.currentLocation = dropoffShelter.id;

    // Update simulation counters
    targetVillage.remaining -= actualEvacCount;
    dropoffShelter.availableCap -= actualEvacCount;
    dropoffShelter.projectedOccupancy += actualEvacCount;
    totalTrappedRemaining -= actualEvacCount;
    totalShelterCapacityLeft -= actualEvacCount;

    addLog(
      `${targetBoat.shortName} dispatched: ${missionLeg.fromNode} -> ${targetVillage.id} (Evacuate ${actualEvacCount}) -> ${dropoffShelter.id} (+${tripDistance} km, ${missionLeg.durationMinutes}m)`
    );
  }

  // Combine missions sorted by start time
  const allMissions = fleet
    .flatMap(b => b.missions)
    .sort((a, b) => a.startTimeMin - b.startTimeMin);

  const totalEvacuatedPlan = fleet.reduce((sum, b) => sum + b.totalEvacuated, 0);
  const totalFleetDistanceKm = parseFloat(fleet.reduce((sum, b) => sum + b.totalDistanceKm, 0).toFixed(1));
  const maxOperationTimeMin = Math.max(0, ...fleet.map(b => b.availableAtMinutes));

  addLog(
    `Optimization Complete: ${allMissions.length} mission legs scheduled. Total Evacuated: ${totalEvacuatedPlan} persons. Max Fleet Time: ${maxOperationTimeMin} mins.`
  );

  return {
    missions: allMissions,
    fleetSchedules: fleet.map(b => ({
      boatId: b.id,
      name: b.name,
      shortName: b.shortName,
      color: b.color,
      speedKmH: b.speedKmH,
      capacity: b.capacity,
      missions: b.missions,
      totalEvacuated: b.totalEvacuated,
      totalDistanceKm: parseFloat(b.totalDistanceKm.toFixed(1)),
      totalTimeMinutes: b.availableAtMinutes
    })),
    summary: {
      totalMissions: allMissions.length,
      totalEvacuated: totalEvacuatedPlan,
      remainingUnserved: totalTrappedRemaining,
      totalDistanceKm: totalFleetDistanceKm,
      maxOperationDurationMin: maxOperationTimeMin,
      shelterOccupancyForecast: simShelters.map(s => ({
        id: s.id,
        name: s.name,
        maxCap: s.maxCap,
        initial: s.currentOccupancy,
        projected: s.projectedOccupancy,
        pct: Math.round((s.projectedOccupancy / s.maxCap) * 100)
      }))
    },
    logs
  };
}

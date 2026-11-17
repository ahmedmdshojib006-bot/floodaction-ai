// Tactical Waterway Routing Engine (Dijkstra Shortest Path with Dynamic Blockages)

export function buildAdjacencyGraph(channels, nodesMap) {
  const adj = {};

  // Initialize adjacency list for all known nodes
  Object.keys(nodesMap).forEach((nodeId) => {
    adj[nodeId] = [];
  });

  channels.forEach((ch) => {
    if (!adj[ch.from]) adj[ch.from] = [];
    if (!adj[ch.to]) adj[ch.to] = [];

    // Only include traversable channels
    if (!ch.isBlocked) {
      adj[ch.from].push({ node: ch.to, distance: ch.distanceKm, channelId: ch.id });
      adj[ch.to].push({ node: ch.from, distance: ch.distanceKm, channelId: ch.id });
    }
  });

  return adj;
}

// Dijkstra Algorithm for finding shortest navigable waterway path
export function findShortestPath(startNodeId, targetNodeId, channels, nodesMap) {
  if (startNodeId === targetNodeId) {
    return { path: [startNodeId], distanceKm: 0, channelsTraversed: [] };
  }

  const adj = buildAdjacencyGraph(channels, nodesMap);
  const distances = {};
  const previous = {};
  const prevChannel = {};
  const unvisited = new Set(Object.keys(nodesMap));

  Object.keys(nodesMap).forEach((id) => {
    distances[id] = Infinity;
  });
  distances[startNodeId] = 0;

  while (unvisited.size > 0) {
    // Find node with minimum distance
    let current = null;
    let minDistance = Infinity;

    unvisited.forEach((id) => {
      if (distances[id] < minDistance) {
        minDistance = distances[id];
        current = id;
      }
    });

    if (current === null || minDistance === Infinity) {
      break; // Remaining nodes are unreachable
    }

    if (current === targetNodeId) {
      break; // Reached destination
    }

    unvisited.delete(current);

    const neighbors = adj[current] || [];
    for (const neighbor of neighbors) {
      if (unvisited.has(neighbor.node)) {
        const alt = distances[current] + neighbor.distance;
        if (alt < distances[neighbor.node]) {
          distances[neighbor.node] = alt;
          previous[neighbor.node] = current;
          prevChannel[neighbor.node] = neighbor.channelId;
        }
      }
    }
  }

  if (distances[targetNodeId] === Infinity) {
    return null; // No navigable route available (all channels blocked)
  }

  // Reconstruct path
  const path = [];
  const channelsTraversed = [];
  let curr = targetNodeId;

  while (curr) {
    path.unshift(curr);
    if (prevChannel[curr]) {
      channelsTraversed.unshift(prevChannel[curr]);
    }
    curr = previous[curr];
  }

  return {
    path,
    distanceKm: parseFloat(distances[targetNodeId].toFixed(2)),
    channelsTraversed
  };
}

// Calculate travel time in minutes based on distance and boat speed
export function calculateTravelTimeMinutes(distanceKm, speedKmH) {
  if (!speedKmH || speedKmH <= 0) return 0;
  return Math.round((distanceKm / speedKmH) * 60);
}

// Find nearest available shelter from a given node
export function findNearestAvailableShelter(fromNodeId, shelters, channels, nodesMap, neededCapacity = 1) {
  // Candidate shelters that have enough remaining capacity
  const validShelters = shelters.filter(s => (s.maxCap - s.currentOccupancy) >= neededCapacity);
  
  // Fallback to any shelter with at least 1 capacity if neededCapacity is high
  const candidates = validShelters.length > 0 
    ? validShelters 
    : shelters.filter(s => (s.maxCap - s.currentOccupancy) > 0);

  if (candidates.length === 0) return null;

  let best = null;
  let minDistance = Infinity;

  for (const shelter of candidates) {
    const route = findShortestPath(fromNodeId, shelter.id, channels, nodesMap);
    if (route && route.distanceKm < minDistance) {
      minDistance = route.distanceKm;
      best = {
        shelter,
        route,
        distanceKm: route.distanceKm
      };
    }
  }

  return best;
}

// Coordinate Interpolator for Simulation
export function getCoordinatesAlongPath(path, nodesMap, progressRatio) {
  if (!path || path.length === 0) return { x: 0, y: 0, heading: 0 };
  if (path.length === 1) {
    const pt = nodesMap[path[0]] || { x: 0, y: 0 };
    return { x: pt.x, y: pt.y, heading: 0 };
  }

  const segments = [];
  let totalLength = 0;

  for (let i = 0; i < path.length - 1; i++) {
    const p1 = nodesMap[path[i]];
    const p2 = nodesMap[path[i + 1]];
    if (!p1 || !p2) continue;
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy);
    segments.push({ p1, p2, len, dx, dy });
    totalLength += len;
  }

  if (totalLength === 0) {
    const pt = nodesMap[path[0]] || { x: 0, y: 0 };
    return { x: pt.x, y: pt.y, heading: 0 };
  }

  const clampedProgress = Math.max(0, Math.min(1, progressRatio));
  const targetDist = clampedProgress * totalLength;

  let accumulated = 0;
  for (const seg of segments) {
    if (accumulated + seg.len >= targetDist || seg === segments[segments.length - 1]) {
      const segProgress = seg.len > 0 ? (targetDist - accumulated) / seg.len : 0;
      const x = seg.p1.x + seg.dx * segProgress;
      const y = seg.p1.y + seg.dy * segProgress;
      const heading = (Math.atan2(seg.dy, seg.dx) * 180) / Math.PI;
      return { x, y, heading };
    }
    accumulated += seg.len;
  }

  const lastPt = nodesMap[path[path.length - 1]];
  return { x: lastPt.x, y: lastPt.y, heading: 0 };
}

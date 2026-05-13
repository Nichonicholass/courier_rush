import type { GameEdge, DijkstraStep } from '@/types';

export interface DijkstraResult {
  distances: Map<string, number>;
  previous: Map<string, string | null>;
  steps: DijkstraStep[];
}

interface EdgeInput {
  from: string;
  to: string;
  weight: number;
  blocked?: boolean;
}

function distSnapshot(distances: Map<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  distances.forEach((v, k) => { out[k] = v === Infinity ? 999999 : v; });
  return out;
}

/**
 * Dijkstra's Shortest Path Algorithm
 *
 * Time Complexity:  O(V²) — linear scan for minimum each iteration
 * Space Complexity: O(V)
 *
 * Computes shortest distances from startNode to all other nodes.
 */
export function dijkstra(
  nodes: string[],
  edges: EdgeInput[],
  startNode: string
): DijkstraResult {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const steps: DijkstraStep[] = [];

  // Initialization: set all distances to ∞, source to 0
  for (const node of nodes) {
    distances.set(node, node === startNode ? 0 : Infinity);
    previous.set(node, null);
  }

  steps.push({
    current: startNode,
    visited: [],
    distances: distSnapshot(distances),
    description: `Initialize: set distance[${startNode}] = 0, all others = ∞`,
  });

  const unvisited = new Set<string>(nodes);

  while (unvisited.size > 0) {
    // Pick the unvisited node with the smallest tentative distance (linear scan)
    let current: string | null = null;
    let minDist = Infinity;

    unvisited.forEach((node) => {
      const d = distances.get(node) ?? Infinity;
      if (d < minDist) { minDist = d; current = node; }
    });

    // All remaining nodes are unreachable
    if (current === null || minDist === Infinity) break;

    unvisited.delete(current);
    visited.add(current);

    // Relax all neighbours of current
    const relaxations: string[] = [];

    for (const edge of edges) {
      if (edge.blocked) continue;
      if (edge.from !== current && edge.to !== current) continue;

      const neighbor = edge.from === current ? edge.to : edge.from;
      if (visited.has(neighbor)) continue;

      const newDist = (distances.get(current) ?? 0) + edge.weight;
      const oldDist = distances.get(neighbor) ?? Infinity;

      if (newDist < oldDist) {
        distances.set(neighbor, newDist);
        previous.set(neighbor, current);
        relaxations.push(`${neighbor}=${newDist}`);
      }
    }

    const visitedArr: string[] = [];
    visited.forEach((v) => visitedArr.push(v));

    steps.push({
      current,
      visited: visitedArr,
      distances: distSnapshot(distances),
      description:
        relaxations.length > 0
          ? `Visit "${current}" (dist=${minDist}) → relax: ${relaxations.join(', ')}`
          : `Visit "${current}" (dist=${minDist}) → no improvements`,
    });
  }

  return { distances, previous, steps };
}

/**
 * Reconstruct path from start → end using the previous map from dijkstra().
 */
export function reconstructPath(
  previous: Map<string, string | null>,
  start: string,
  end: string
): string[] {
  const path: string[] = [];
  let current: string | null = end;

  while (current !== null) {
    path.unshift(current);
    current = previous.get(current) ?? null;
  }

  if (path[0] !== start) return [];
  return path;
}

/**
 * Sum of edge weights along a given path.
 */
export function pathDistance(path: string[], edges: EdgeInput[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i];
    const b = path[i + 1];
    const edge = edges.find(
      (e) => (e.from === a && e.to === b) || (e.from === b && e.to === a)
    );
    if (edge) total += edge.weight;
  }
  return total;
}

/**
 * Run Dijkstra from every node and return a map of results.
 */
export function allPairsShortestPaths(
  nodes: string[],
  edges: GameEdge[]
): Map<string, DijkstraResult> {
  const results = new Map<string, DijkstraResult>();
  for (const node of nodes) {
    results.set(node, dijkstra(nodes, edges, node));
  }
  return results;
}

/**
 * Greedy Nearest-Neighbour heuristic for multi-stop delivery.
 *
 * Uses the APSP distance matrix to greedily pick the closest unvisited
 * destination at each step. O(n²) where n = number of destinations.
 */
export function greedyDeliveryOrder(
  warehouse: string,
  destinations: string[],
  allPairs: Map<string, DijkstraResult>
): { order: string[]; totalDistance: number; fullPath: string[] } {
  const remaining = new Set<string>(destinations);
  const order: string[] = [warehouse];
  const fullPath: string[] = [warehouse];
  let totalDistance = 0;
  let current = warehouse;

  while (remaining.size > 0) {
    let nearest: string | null = null;
    let nearestDist = Infinity;

    remaining.forEach((dest) => {
      const dist = allPairs.get(current)?.distances.get(dest) ?? Infinity;
      if (dist < nearestDist) { nearestDist = dist; nearest = dest; }
    });

    if (nearest === null || nearestDist === Infinity) break;

    const result = allPairs.get(current);
    if (result) {
      const subPath = reconstructPath(result.previous, current, nearest);
      fullPath.push(...subPath.slice(1));
    }

    totalDistance += nearestDist;
    order.push(nearest);
    remaining.delete(nearest);
    current = nearest;
  }

  // Return to warehouse
  const returnResult = allPairs.get(current);
  if (returnResult) {
    const returnDist = returnResult.distances.get(warehouse) ?? Infinity;
    if (returnDist < Infinity) {
      const returnPath = reconstructPath(returnResult.previous, current, warehouse);
      fullPath.push(...returnPath.slice(1));
      totalDistance += returnDist;
      order.push(warehouse);
    }
  }

  return { order, totalDistance, fullPath };
}

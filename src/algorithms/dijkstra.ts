import type { GameEdge, DijkstraStep, DeliveryPackage } from '@/types';

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

export function dijkstra(
  nodes: string[],
  edges: EdgeInput[],
  startNode: string
): DijkstraResult {
  const distances = new Map<string, number>();
  const previous = new Map<string, string | null>();
  const visited = new Set<string>();
  const steps: DijkstraStep[] = [];

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
    let current: string | null = null;
    let minDist = Infinity;

    unvisited.forEach((node) => {
      const d = distances.get(node) ?? Infinity;
      if (d < minDist) { minDist = d; current = node; }
    });

    if (current === null || minDist === Infinity) break;

    unvisited.delete(current);
    visited.add(current);

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

function getPermutations(arr: string[]): string[][] {
  if (arr.length <= 1) return [arr];
  const result: string[][] = [];
  
  for (let i = 0; i < arr.length; i++) {
    const current = arr[i];
    const remaining = arr.slice(0, i).concat(arr.slice(i + 1));
    const remainingPerms = getPermutations(remaining);
    for (const perm of remainingPerms) {
      result.push([current, ...perm]);
    }
  }
  return result;
}

/**
 * Exact TSP Solver for multi-stop delivery.
 * 
 * Computes all permutations of destinations. Enforces the rule that 
 * 'urgent' packages MUST be delivered before 'normal' packages.
 */
export function optimalDeliveryOrder(
  warehouse: string,
  packages: DeliveryPackage[],
  allPairs: Map<string, DijkstraResult>,
  requireReturnToWarehouse: boolean = false
): { order: string[]; totalDistance: number; fullPath: string[] } {
  
  const urgentDests = packages.filter(p => p.priority === 'urgent').map(p => p.destination);
  const allDests = packages.map(p => p.destination);
  
  const perms = getPermutations(allDests);
  let bestDist = Infinity;
  let bestOrder: string[] = [];
  let bestFullPath: string[] = [];

  for (const perm of perms) {
    // CONSTRAINT CHECK: Ensure all urgent packages are visited first
    let validPriority = true;
    for (let i = 0; i < urgentDests.length; i++) {
      if (!urgentDests.includes(perm[i])) {
        validPriority = false;
        break;
      }
    }
    if (!validPriority) continue;

    let currentDist = 0;
    let current = warehouse;
    const currentFullPath: string[] = [warehouse];
    const currentOrder: string[] = [warehouse];
    let validRoute = true;

    // Route through the current permutation sequence
    for (const dest of perm) {
      const dist = allPairs.get(current)?.distances.get(dest) ?? Infinity;
      
      if (dist === Infinity) { 
        validRoute = false; 
        break; 
      }

      currentDist += dist;
      const result = allPairs.get(current);
      if (result) {
        const subPath = reconstructPath(result.previous, current, dest);
        currentFullPath.push(...subPath.slice(1));
      }
      
      currentOrder.push(dest);
      current = dest;
    }

    // Return to warehouse (set to false to match your game's rules)
    if (requireReturnToWarehouse && validRoute) {
      const returnDist = allPairs.get(current)?.distances.get(warehouse) ?? Infinity;
      if (returnDist === Infinity) {
        validRoute = false;
      } else {
        currentDist += returnDist;
        const result = allPairs.get(current);
        if (result) {
          const returnPath = reconstructPath(result.previous, current, warehouse);
          currentFullPath.push(...returnPath.slice(1));
        }
        currentOrder.push(warehouse);
      }
    }

    if (validRoute && currentDist < bestDist) {
      bestDist = currentDist;
      bestOrder = currentOrder;
      bestFullPath = currentFullPath;
    }
  }

  return { order: bestOrder, totalDistance: bestDist, fullPath: bestFullPath };
}
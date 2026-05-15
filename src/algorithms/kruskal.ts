import type { GameEdge } from '@/types';

// ─── Union-Find (Disjoint Set Union) ────────────────────────────────
export class UnionFind {
  parent: Map<string, string>;
  rank: Map<string, number>;

  constructor(nodes: string[]) {
    this.parent = new Map();
    this.rank = new Map();
    for (const node of nodes) {
      this.parent.set(node, node);
      this.rank.set(node, 0);
    }
  }

  find(x: string): string {
    const p = this.parent.get(x);
    if (p === undefined) return x;
    if (p !== x) {
      // Path compression
      const root = this.find(p);
      this.parent.set(x, root);
      return root;
    }
    return x;
  }

  union(a: string, b: string): boolean {
    const rootA = this.find(a);
    const rootB = this.find(b);
    if (rootA === rootB) return false; // Already in same set (would create cycle)

    const rankA = this.rank.get(rootA) ?? 0;
    const rankB = this.rank.get(rootB) ?? 0;

    // Union by rank
    if (rankA < rankB) {
      this.parent.set(rootA, rootB);
    } else if (rankA > rankB) {
      this.parent.set(rootB, rootA);
    } else {
      this.parent.set(rootB, rootA);
      this.rank.set(rootA, rankA + 1);
    }
    return true;
  }

  connected(a: string, b: string): boolean {
    return this.find(a) === this.find(b);
  }
}

// ─── Kruskal Step (for visualization) ───────────────────────────────
export interface KruskalStep {
  edgeId: string;
  from: string;
  to: string;
  weight: number;
  accepted: boolean;
  reason: string;
  mstEdgesSoFar: string[]; // edge IDs in MST at this point
  totalCostSoFar: number;
}

export interface KruskalResult {
  mstEdges: GameEdge[];
  totalCost: number;
  steps: KruskalStep[];
  allConnected: boolean;
}

// ─── Kruskal's Algorithm ────────────────────────────────────────────
/**
 * Kruskal's Minimum Spanning Tree algorithm.
 * 
 * 1. Sort all edges by weight (ascending).
 * 2. For each edge, if it connects two different components → add to MST.
 * 3. If it would create a cycle → skip.
 * 4. Stop when MST has (V-1) edges.
 * 
 * Time complexity: O(E log E) due to sorting.
 */
export function kruskal(
  nodes: string[],
  edges: GameEdge[]
): KruskalResult {
  // Sort edges by weight (ascending) — this is the core of Kruskal's
  const sortedEdges = [...edges]
    .filter(e => !e.blocked)
    .sort((a, b) => a.weight - b.weight);

  const uf = new UnionFind(nodes);
  const mstEdges: GameEdge[] = [];
  const steps: KruskalStep[] = [];
  let totalCost = 0;

  for (const edge of sortedEdges) {
    const wouldCycle = uf.connected(edge.from, edge.to);

    if (!wouldCycle) {
      uf.union(edge.from, edge.to);
      mstEdges.push(edge);
      totalCost += edge.weight;

      steps.push({
        edgeId: edge.id,
        from: edge.from,
        to: edge.to,
        weight: edge.weight,
        accepted: true,
        reason: `Edge ${edge.from}↔${edge.to} (cost ${edge.weight}) connects two different components → ADDED to MST`,
        mstEdgesSoFar: mstEdges.map(e => e.id),
        totalCostSoFar: totalCost,
      });
    } else {
      steps.push({
        edgeId: edge.id,
        from: edge.from,
        to: edge.to,
        weight: edge.weight,
        accepted: false,
        reason: `Edge ${edge.from}↔${edge.to} (cost ${edge.weight}) would create a cycle → REJECTED`,
        mstEdgesSoFar: mstEdges.map(e => e.id),
        totalCostSoFar: totalCost,
      });
    }

    // MST is complete when we have V-1 edges
    if (mstEdges.length === nodes.length - 1) break;
  }

  // Check if all nodes are connected
  const root = uf.find(nodes[0]);
  const allConnected = nodes.every(n => uf.find(n) === root);

  return { mstEdges, totalCost, steps, allConnected };
}

/**
 * Validate a player's edge selection against the optimal MST.
 * Returns how much more the player's MST costs vs the optimal.
 */
export function validatePlayerMST(
  playerEdgeIds: string[],
  nodes: string[],
  edges: GameEdge[]
): {
  isValidTree: boolean;
  isConnected: boolean;
  playerCost: number;
  optimalCost: number;
  savings: number;
  efficiency: number;
} {
  const playerEdges = edges.filter(e => playerEdgeIds.includes(e.id));
  const uf = new UnionFind(nodes);
  let hasCycle = false;
  let playerCost = 0;

  for (const edge of playerEdges) {
    if (uf.connected(edge.from, edge.to)) {
      hasCycle = true;
    }
    uf.union(edge.from, edge.to);
    playerCost += edge.weight;
  }

  const root = uf.find(nodes[0]);
  const isConnected = nodes.every(n => uf.find(n) === root);

  const optimal = kruskal(nodes, edges);

  return {
    isValidTree: !hasCycle && isConnected,
    isConnected,
    playerCost,
    optimalCost: optimal.totalCost,
    savings: playerCost - optimal.totalCost,
    efficiency: optimal.totalCost > 0
      ? Math.round((optimal.totalCost / Math.max(playerCost, 1)) * 100)
      : 100,
  };
}

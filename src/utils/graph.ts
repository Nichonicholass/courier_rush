import type { GameGraph, GameNode, GameEdge, Difficulty, DeliveryPackage } from '@/types';

let edgeCounter = 0;
function makeEdge(from: string, to: string, weight: number): GameEdge {
  return { id: `e${edgeCounter++}`, from, to, weight, blocked: false, slowed: false };
}

// ─── Easy: 5 nodes ────────────────────────────────────────────────────────────
const easyNodes: GameNode[] = [
  { id: 'W',  label: 'Warehouse', x: 90,  y: 290, type: 'warehouse' },
  { id: 'A',  label: 'Bakery',    x: 270, y: 120, type: 'delivery'  },
  { id: 'B',  label: 'Hospital',  x: 490, y: 80,  type: 'delivery'  },
  { id: 'C',  label: 'Market',    x: 340, y: 400, type: 'waypoint'  },
  { id: 'D',  label: 'School',    x: 680, y: 290, type: 'delivery'  },
];

const easyEdges: GameEdge[] = [
  makeEdge('W', 'A', 5),
  makeEdge('W', 'C', 7),
  makeEdge('A', 'B', 4),
  makeEdge('A', 'C', 6),
  makeEdge('B', 'D', 8),
  makeEdge('B', 'C', 9),
  makeEdge('C', 'D', 5),
];

// ─── Medium: 8 nodes ──────────────────────────────────────────────────────────
const mediumNodes: GameNode[] = [
  { id: 'W',  label: 'Warehouse', x: 80,  y: 300, type: 'warehouse' },
  { id: 'A',  label: 'Bakery',    x: 220, y: 130, type: 'delivery'  },
  { id: 'B',  label: 'Hospital',  x: 440, y: 80,  type: 'delivery'  },
  { id: 'C',  label: 'Market',    x: 310, y: 390, type: 'waypoint'  },
  { id: 'D',  label: 'School',    x: 600, y: 160, type: 'waypoint'  },
  { id: 'E',  label: 'Park',      x: 510, y: 370, type: 'waypoint'  },
  { id: 'F',  label: 'Library',   x: 710, y: 310, type: 'delivery'  },
  { id: 'G',  label: 'Station',   x: 160, y: 460, type: 'delivery'  },
];

const mediumEdges: GameEdge[] = [
  makeEdge('W', 'A', 5),
  makeEdge('W', 'C', 8),
  makeEdge('W', 'G', 6),
  makeEdge('A', 'B', 4),
  makeEdge('A', 'C', 7),
  makeEdge('B', 'D', 5),
  makeEdge('B', 'E', 9),
  makeEdge('C', 'E', 6),
  makeEdge('C', 'G', 5),
  makeEdge('D', 'F', 4),
  makeEdge('E', 'F', 5),
  makeEdge('E', 'D', 3),
];

// ─── Hard: 12 nodes ───────────────────────────────────────────────────────────
const hardNodes: GameNode[] = [
  { id: 'W',  label: 'Warehouse', x: 80,  y: 300, type: 'warehouse' },
  { id: 'A',  label: 'Bakery',    x: 200, y: 140, type: 'delivery'  },
  { id: 'B',  label: 'Hospital',  x: 380, y: 80,  type: 'delivery'  },
  { id: 'C',  label: 'Market',    x: 260, y: 390, type: 'waypoint'  },
  { id: 'D',  label: 'School',    x: 500, y: 160, type: 'waypoint'  },
  { id: 'E',  label: 'Park',      x: 450, y: 360, type: 'waypoint'  },
  { id: 'F',  label: 'Library',   x: 640, y: 260, type: 'delivery'  },
  { id: 'G',  label: 'Station',   x: 140, y: 460, type: 'waypoint'  },
  { id: 'H',  label: 'Museum',    x: 600, y: 440, type: 'waypoint'  },
  { id: 'I',  label: 'Airport',   x: 760, y: 160, type: 'delivery'  },
  { id: 'J',  label: 'Hotel',     x: 340, y: 500, type: 'waypoint'  },
  { id: 'K',  label: 'Stadium',   x: 760, y: 420, type: 'delivery'  },
];

const hardEdges: GameEdge[] = [
  makeEdge('W', 'A', 5),
  makeEdge('W', 'C', 8),
  makeEdge('W', 'G', 6),
  makeEdge('A', 'B', 4),
  makeEdge('A', 'C', 7),
  makeEdge('A', 'D', 10),
  makeEdge('B', 'D', 5),
  makeEdge('B', 'I', 9),
  makeEdge('C', 'E', 6),
  makeEdge('C', 'G', 5),
  makeEdge('C', 'J', 7),
  makeEdge('D', 'F', 4),
  makeEdge('D', 'E', 6),
  makeEdge('E', 'F', 5),
  makeEdge('E', 'H', 4),
  makeEdge('F', 'I', 8),
  makeEdge('F', 'K', 6),
  makeEdge('G', 'J', 5),
  makeEdge('H', 'K', 5),
  makeEdge('I', 'K', 7),
  makeEdge('J', 'H', 6),
];

/// ─── Public API ───────────────────────────────────────────────────────────────
const GRAPHS: Record<Difficulty, GameGraph> = {
  easy:   { nodes: easyNodes,   edges: easyEdges   },
  medium: { nodes: mediumNodes, edges: mediumEdges  },
  hard:   { nodes: hardNodes,   edges: hardEdges    },
};

// Replace the hardcoded DELIVERIES array with counts
const PACKAGE_COUNTS: Record<Difficulty, number> = {
  easy:   3,
  medium: 4,
  hard:   5,
};

export function getGraphForDifficulty(difficulty: Difficulty): GameGraph {
  // Deep clone so mutations (blocked roads) don't bleed between games
  const src = GRAPHS[difficulty];
  return {
    nodes: src.nodes.map((n) => ({ ...n })),
    edges: src.edges.map((e) => ({ ...e })),
  };
}

export function getPackagesForDifficulty(difficulty: Difficulty, currentGraph?: GameGraph): DeliveryPackage[] {
  // Use the actively cloned graph if provided, otherwise fall back to base
  const graph = currentGraph ?? GRAPHS[difficulty];
  const count = PACKAGE_COUNTS[difficulty];

  // 1. Filter out the Warehouse (W) so it's never a delivery target
  const eligibleNodes = graph.nodes.filter((n) => n.id !== 'W');

  // 2. Randomly shuffle the eligible nodes (Fisher-Yates style sort)
  const shuffled = [...eligibleNodes].sort(() => 0.5 - Math.random());
  
  // 3. Pick the top N nodes based on difficulty
  const selectedDestinations = shuffled.slice(0, count);

  // 4. Map them to your DeliveryPackage type
  return selectedDestinations.map((node, i) => ({
    id: `pkg-${i}`,
    destination: node.id,
    priority: i === 0 ? 'urgent' : 'normal',
    delivered: false,
  }));
}

// ... (keep getAdjacentNodes, getEdgeBetween, computePathDistance, computeScore the same)

export function getAdjacentNodes(nodeId: string, edges: GameEdge[]): string[] {
  return edges
    .filter((e) => !e.blocked && (e.from === nodeId || e.to === nodeId))
    .map((e) => (e.from === nodeId ? e.to : e.from));
}

export function getEdgeBetween(
  from: string,
  to: string,
  edges: GameEdge[]
): GameEdge | undefined {
  return edges.find(
    (e) => (e.from === from && e.to === to) || (e.from === to && e.to === from)
  );
}

export function computePathDistance(path: string[], edges: GameEdge[]): number {
  let total = 0;
  for (let i = 0; i < path.length - 1; i++) {
    const edge = getEdgeBetween(path[i], path[i + 1], edges);
    total += edge ? edge.weight : 0;
  }
  return total;
}

export function computeScore(
  playerDistance: number,
  optimalDistance: number,
  timeElapsed: number,
  allDelivered: boolean
): number {
  if (!allDelivered) return 0;
  const efficiency = optimalDistance / Math.max(playerDistance, 1);
  const base = Math.round(efficiency * 800);
  const timeBonus = Math.max(0, 300 - Math.floor(timeElapsed / 1000));
  return Math.min(1000, base + timeBonus);
}

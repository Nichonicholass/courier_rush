export type Difficulty = 'easy' | 'medium' | 'hard';
export type GamePhase = 'menu' | 'difficulty' | 'playing' | 'result';
export type NodeType = 'warehouse' | 'delivery' | 'waypoint';
export type PackagePriority = 'normal' | 'urgent';
export type TrafficEventType = 'blocked' | 'slow';

export interface GameNode {
  id: string;
  label: string;
  x: number;
  y: number;
  type: NodeType;
}

export interface GameEdge {
  id: string;
  from: string;
  to: string;
  weight: number;
  blocked: boolean;
  slowed: boolean;
}

export interface GameGraph {
  nodes: GameNode[];
  edges: GameEdge[];
}

export interface DeliveryPackage {
  id: string;
  destination: string;
  priority: PackagePriority;
  delivered: boolean;
}

export interface TrafficEvent {
  id: string;
  edgeId: string;
  type: TrafficEventType;
  message: string;
  duration: number;
  remainingTime: number;
}

export interface RouteStep {
  from: string;
  to: string;
  distance: number;
}

export interface OptimalRoute {
  order: string[];
  totalDistance: number;
  pathDetails: RouteStep[];
}

export interface GameResult {
  playerPath: string[];
  playerDistance: number;
  optimalRoute: OptimalRoute;
  efficiency: number;
  score: number;
  timeElapsed: number;
  difficulty: Difficulty;
  allDelivered: boolean;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  difficulty: Difficulty;
  efficiency: number;
  timeElapsed: number;
  date: string;
}

export interface DijkstraStep {
  current: string;
  visited: string[];
  distances: Record<string, number>;
  description: string;
}

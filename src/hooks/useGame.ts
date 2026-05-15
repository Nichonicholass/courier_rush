import { useState, useCallback, useRef } from 'react';
import {
  getGraphForDifficulty,
  getPackagesForDifficulty,
  getAdjacentNodes,
  getEdgeBetween,
  computeScore,
} from '@/utils/graph';
import { allPairsShortestPaths, optimalDeliveryOrder } from '@/algorithms/dijkstra';
import type {
  Difficulty,
  GamePhase,
  GameGraph,
  DeliveryPackage,
  TrafficEvent,
  GameResult,
  OptimalRoute,
  MSTResult,
} from '@/types';

const EMPTY_GRAPH: GameGraph = { nodes: [], edges: [] };

export function useGame() {
  const [phase, setPhase]               = useState<GamePhase>('menu');
  const [difficulty, setDifficulty]     = useState<Difficulty>('easy');
  const [graph, setGraph]               = useState<GameGraph>(EMPTY_GRAPH);
  const [packages, setPackages]         = useState<DeliveryPackage[]>([]);
  const [currentNode, setCurrentNode]   = useState<string>('W');
  const [playerPath, setPlayerPath]     = useState<string[]>(['W']);
  const [playerDistance, setPlayerDistance] = useState(0);
  const [events, setEvents]             = useState<TrafficEvent[]>([]);
  const [result, setResult]             = useState<GameResult | null>(null);
  const [optimalRoute, setOptimalRoute] = useState<OptimalRoute | null>(null);
  const [showOptimal, setShowOptimal]   = useState(false);
  const [message, setMessage]           = useState<string>('');

  const optimalRouteRef = useRef<OptimalRoute | null>(null);
  const difficultyRef   = useRef<Difficulty>('easy');
  const mstResultRef    = useRef<MSTResult | null>(null);

  // 🆕 Initialize graph and enter MST phase
  const initGraph = useCallback((diff: Difficulty) => {
    const g = getGraphForDifficulty(diff);
    difficultyRef.current = diff;
    setDifficulty(diff);
    setGraph(g);
    setPhase('mst');
  }, []);

  // Helper: set up game state after graph is ready
  const setupGame = useCallback((g: GameGraph, diff: Difficulty) => {
    const pkgs = getPackagesForDifficulty(diff, g);

    // Update node types for delivery targets
    const destinationIds = pkgs.map(p => p.destination);
    g.nodes = g.nodes.map(node => ({
      ...node,
      type: node.id === 'W' ? 'warehouse' : (destinationIds.includes(node.id) ? 'delivery' : 'waypoint')
    }));

    setGraph(g);
    setPackages(pkgs);
    setCurrentNode('W');
    setPlayerPath(['W']);
    setPlayerDistance(0);
    setEvents([]);
    setResult(null);
    setOptimalRoute(null);
    setShowOptimal(false);
    setMessage('');
    setPhase('playing');

    // Pre-compute optimal route
    const nodeIds = g.nodes.map((n) => n.id);
    const apsp = allPairsShortestPaths(nodeIds, g.edges);
    const optimal = optimalDeliveryOrder('W', pkgs, apsp, false);

    const pathDetails = [];
    for (let i = 0; i < optimal.fullPath.length - 1; i++) {
      const edge = getEdgeBetween(optimal.fullPath[i], optimal.fullPath[i + 1], g.edges);
      pathDetails.push({
        from: optimal.fullPath[i],
        to: optimal.fullPath[i + 1],
        distance: edge?.weight ?? 0,
      });
    }

    const opt: OptimalRoute = {
      order: optimal.order,
      totalDistance: optimal.totalDistance,
      pathDetails,
    };
    optimalRouteRef.current = opt;
    setOptimalRoute(opt);
  }, []);

  // 🆕 Start game AFTER MST phase completion
  const startGameAfterMST = useCallback((mstRes: MSTResult) => {
    mstResultRef.current = mstRes;
    const g = getGraphForDifficulty(difficultyRef.current);
    setupGame(g, difficultyRef.current);
  }, [setupGame]);

  // 🆕 Skip MST and start directly
  const startGameSkipMST = useCallback(() => {
    mstResultRef.current = null;
    const g = getGraphForDifficulty(difficultyRef.current);
    setupGame(g, difficultyRef.current);
  }, [setupGame]);

  // 🔧 Legacy start (kept for compatibility)
  const startGame = useCallback((diff: Difficulty) => {
    difficultyRef.current = diff;
    setDifficulty(diff);
    mstResultRef.current = null;
    const g = getGraphForDifficulty(diff);
    setupGame(g, diff);
  }, [setupGame]);

  // 🏁 Finish game and compute result
  const finishGame = useCallback((
    path: string[],
    distance: number,
    elapsed: number,
    pkgs: DeliveryPackage[],
    allDelivered: boolean,
  ) => {
    const optimal = optimalRouteRef.current ?? { order: [], totalDistance: distance, pathDetails: [] };
    const efficiency = (optimal.totalDistance / Math.max(distance, 1)) * 100;

    let baseScore = computeScore(distance, optimal.totalDistance, elapsed, allDelivered);

    // Add MST bonus if available
    const mstRes = mstResultRef.current;
    const mstBonus = mstRes ? mstRes.bonusScore : 0;
    const totalScore = Math.min(1200, baseScore + mstBonus);

    setResult({
      playerPath: path,
      playerDistance: distance,
      optimalRoute: optimal,
      efficiency,
      score: totalScore,
      timeElapsed: elapsed,
      difficulty: difficultyRef.current,
      allDelivered,
      mstBonus,
      mstEfficiency: mstRes?.efficiency,
    });
    setShowOptimal(true);
    setPhase('result');
  }, []);

  // 🚗 Player moves to adjacent node
  const moveToNode = useCallback((targetId: string, elapsed: number) => {
    if (phase !== 'playing') return;

    const adjacent = getAdjacentNodes(currentNode, graph.edges);
    if (!adjacent.includes(targetId)) {
      setMessage('Cannot move there — no direct road from here!');
      setTimeout(() => setMessage(''), 2000);
      return;
    }

    const edge = getEdgeBetween(currentNode, targetId, graph.edges);
    const dist = edge ? (edge.slowed ? edge.weight * 2 : edge.weight) : 0;

    const newPath = [...playerPath, targetId];
    const newDist = playerDistance + dist;
    setCurrentNode(targetId);
    setPlayerPath(newPath);
    setPlayerDistance(newDist);

    // Deliver package if this node is a destination
    const newPackages = packages.map((p) =>
      p.destination === targetId && !p.delivered ? { ...p, delivered: true } : p
    );

    const justDelivered = packages.find((p) => p.destination === targetId && !p.delivered);
    if (justDelivered) {
      setMessage(`📦 Package delivered to ${targetId}!`);
      setTimeout(() => setMessage(''), 2000);
    }

    setPackages(newPackages);

    if (newPackages.every((p) => p.delivered)) {
      finishGame(newPath, newDist, elapsed, newPackages, true);
    }
  }, [phase, currentNode, graph.edges, playerPath, playerDistance, packages, finishGame]);

  // 🏳️ Give up / finish early
  const giveUp = useCallback((elapsed: number) => {
    finishGame(playerPath, playerDistance, elapsed, packages, false);
  }, [finishGame, playerPath, playerDistance, packages]);

  // 🚦 Traffic event
  const triggerRandomEvent = useCallback(() => {
    if (graph.edges.length === 0) return;
    const eligible = graph.edges.filter(
      (e) => e.from !== 'W' && e.to !== 'W' && !e.blocked
    );
    if (eligible.length === 0) return;

    const edge = eligible[Math.floor(Math.random() * eligible.length)];
    const isBlock = Math.random() > 0.4;
    const duration = isBlock ? 20000 : 15000;

    const event: TrafficEvent = {
      id: crypto.randomUUID(),
      edgeId: edge.id,
      type: isBlock ? 'blocked' : 'slow',
      message: isBlock
        ? `🚧 Road ${edge.from}→${edge.to} is BLOCKED! Find another route.`
        : `🐌 Road ${edge.from}→${edge.to} has heavy traffic (×2 cost).`,
      duration,
      remainingTime: duration,
    };

    setGraph((prev) => ({
      ...prev,
      edges: prev.edges.map((e) =>
        e.id === edge.id ? { ...e, blocked: isBlock, slowed: !isBlock } : e
      ),
    }));
    setEvents((prev) => [...prev, event]);
    setMessage(event.message);

    setTimeout(() => {
      setGraph((prev) => ({
        ...prev,
        edges: prev.edges.map((e) =>
          e.id === edge.id ? { ...e, blocked: false, slowed: false } : e
        ),
      }));
      setEvents((prev) => prev.filter((ev) => ev.id !== event.id));
      setMessage('🟢 Road cleared!');
      setTimeout(() => setMessage(''), 2000);
    }, duration);
  }, [graph.edges]);

  const toggleShowOptimal = useCallback(() => setShowOptimal((v) => !v), []);

  const goToMenu = useCallback(() => {
    setPhase('menu');
    setResult(null);
  }, []);

  return {
    phase, difficulty, graph, packages, currentNode,
    playerPath, playerDistance, events, result, optimalRoute,
    showOptimal, message,
    initGraph, startGame, startGameAfterMST, startGameSkipMST,
    moveToNode, giveUp, triggerRandomEvent, goToMenu,
    toggleShowOptimal, setPhase,
  };
}

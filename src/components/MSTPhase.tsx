'use client';
import { useState, useMemo, useCallback } from 'react';
import { kruskal, validatePlayerMST } from '@/algorithms/kruskal';
import type { GameGraph, MSTResult } from '@/types';
import styles from './MSTPhase.module.css';

interface Props {
  graph: GameGraph;
  onComplete: (result: MSTResult) => void;
  onBack: () => void;
}

export default function MSTPhase({ graph, onComplete, onBack }: Props) {
  const [selectedEdges, setSelectedEdges] = useState<Set<string>>(new Set());
  const [showHint, setShowHint] = useState(false);
  const [showAlgorithm, setShowAlgorithm] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const nodeIds = useMemo(() => graph.nodes.map(n => n.id), [graph.nodes]);

  const optimalMST = useMemo(
    () => kruskal(nodeIds, graph.edges),
    [nodeIds, graph.edges]
  );

  // Total cost of all edges (for showing potential repair cost)
  const totalAllEdges = useMemo(
    () => graph.edges.reduce((sum, e) => sum + e.weight, 0),
    [graph.edges]
  );

  const selectedCost = useMemo(() => {
    let cost = 0;
    for (const edge of graph.edges) {
      if (selectedEdges.has(edge.id)) cost += edge.weight;
    }
    return cost;
  }, [graph.edges, selectedEdges]);

  const getLabel = useCallback(
    (id: string) => graph.nodes.find(n => n.id === id)?.label ?? id,
    [graph.nodes]
  );

  const toggleEdge = useCallback((edgeId: string) => {
    setErrorMsg('');
    setSelectedEdges(prev => {
      const next = new Set(prev);
      if (next.has(edgeId)) {
        next.delete(edgeId);
      } else {
        next.add(edgeId);
      }
      return next;
    });
  }, []);

  const handleSubmit = useCallback(() => {
    if (selectedEdges.size === 0) {
      setErrorMsg('You need to select at least some roads to repair!');
      return;
    }

    const validation = validatePlayerMST(
      Array.from(selectedEdges),
      nodeIds,
      graph.edges
    );

    if (!validation.isConnected) {
      setErrorMsg('⚠️ Not all locations are connected! Some areas are still unreachable.');
      return;
    }

    // Calculate bonus score: perfect MST = 200 bonus, scales down
    const bonusScore = Math.round(validation.efficiency * 2);

    onComplete({
      playerEdgeIds: Array.from(selectedEdges),
      playerCost: validation.playerCost,
      optimalCost: validation.optimalCost,
      efficiency: validation.efficiency,
      isValid: validation.isValidTree,
      bonusScore,
    });
  }, [selectedEdges, nodeIds, graph.edges, onComplete]);

  const SVG_W = 860;
  const SVG_H = 560;
  const NODE_R = 26;

  const getNode = (id: string) => graph.nodes.find(n => n.id === id);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <span className={styles.phaseIcon}>🔧</span>
          <div>
            <h1 className={styles.title}>Road Repair Phase</h1>
            <p className={styles.subtitle}>
              A storm has damaged all roads! Select the roads to repair so that
              <strong> all locations are connected</strong> with <strong>minimum repair cost</strong>.
            </p>
          </div>
        </div>
        <div className={styles.headerRight}>
          <div className={styles.algorithmTag}>
            <span className={styles.tagIcon}>🧮</span>
            <span>Kruskal&apos;s MST</span>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        {/* Graph Canvas */}
        <div className={styles.canvasWrap}>
          <svg
            viewBox={`0 0 ${SVG_W} ${SVG_H}`}
            className={styles.svg}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <filter id="mstGlow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="mstGlowGreen">
                <feGaussianBlur stdDeviation="6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="selectedEdgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#4ade80" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
              <linearGradient id="hintEdgeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>

            {/* Edges */}
            {graph.edges.map(edge => {
              const a = getNode(edge.from);
              const b = getNode(edge.to);
              if (!a || !b) return null;

              const isSelected = selectedEdges.has(edge.id);
              const isOptimal = showHint && optimalMST.mstEdges.some(e => e.id === edge.id);
              const midX = (a.x + b.x) / 2;
              const midY = (a.y + b.y) / 2;

              return (
                <g
                  key={edge.id}
                  className={styles.edgeGroup}
                  onClick={() => toggleEdge(edge.id)}
                >
                  {/* Clickable hitbox (invisible wider line) */}
                  <line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke="transparent"
                    strokeWidth={20}
                    style={{ cursor: 'pointer' }}
                  />
                  {/* Visible edge */}
                  <line
                    x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                    stroke={
                      isSelected ? 'url(#selectedEdgeGrad)' :
                      isOptimal ? 'url(#hintEdgeGrad)' :
                      '#1e293b'
                    }
                    strokeWidth={isSelected ? 4 : isOptimal ? 3 : 2}
                    strokeDasharray={isSelected ? undefined : '6 4'}
                    filter={isSelected ? 'url(#mstGlowGreen)' : undefined}
                    strokeLinecap="round"
                    style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                  />
                  {/* Weight badge */}
                  <rect
                    x={midX - 16} y={midY - 12}
                    width={32} height={24} rx={6}
                    fill={isSelected ? '#065f46' : '#0f172a'}
                    stroke={isSelected ? '#4ade80' : '#334155'}
                    strokeWidth={1.5}
                    style={{ cursor: 'pointer' }}
                  />
                  <text
                    x={midX} y={midY + 4}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight="700"
                    fill={isSelected ? '#4ade80' : '#64748b'}
                    style={{ cursor: 'pointer', userSelect: 'none' }}
                  >
                    {edge.weight}
                  </text>
                </g>
              );
            })}

            {/* Nodes */}
            {graph.nodes.map(node => (
              <g key={node.id}>
                <circle
                  cx={node.x} cy={node.y} r={NODE_R}
                  fill={node.type === 'warehouse' ? '#4f46e5' : '#1e293b'}
                  stroke={node.type === 'warehouse' ? '#818cf8' : '#475569'}
                  strokeWidth={2.5}
                />
                <text
                  x={node.x} y={node.y + 5}
                  textAnchor="middle"
                  fontSize={node.type === 'warehouse' ? 16 : 13}
                  fontWeight="700"
                  fill="#fff"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {node.type === 'warehouse' ? '🏭' : node.id}
                </text>
                <text
                  x={node.x} y={node.y + NODE_R + 14}
                  textAnchor="middle"
                  fontSize={10}
                  fill="#94a3b8"
                  style={{ userSelect: 'none', pointerEvents: 'none' }}
                >
                  {node.label}
                </text>
              </g>
            ))}

            {/* Legend */}
            <g transform="translate(10, 10)">
              {[
                { dash: false, color: '#4ade80', label: 'Selected (repaired)' },
                { dash: true, color: '#1e293b', label: 'Damaged (click to repair)' },
                ...(showHint ? [{ dash: false, color: '#f59e0b', label: 'Optimal MST edge' }] : []),
              ].map(({ dash, color, label }, i) => (
                <g key={label} transform={`translate(0, ${i * 22})`}>
                  <line
                    x1={0} y1={7} x2={18} y2={7}
                    stroke={color} strokeWidth={3}
                    strokeDasharray={dash ? '6 4' : undefined}
                  />
                  <text x={24} y={11} fontSize={10} fill="#94a3b8">{label}</text>
                </g>
              ))}
            </g>
          </svg>
        </div>

        {/* Side Panel */}
        <div className={styles.sidePanel}>
          {/* Cost Overview */}
          <div className={styles.costCard}>
            <h3 className={styles.cardTitle}>Repair Budget</h3>
            <div className={styles.costRow}>
              <span className={styles.costLabel}>All roads cost</span>
              <span className={styles.costVal}>{totalAllEdges}</span>
            </div>
            <div className={styles.costRow}>
              <span className={styles.costLabel}>Your selection</span>
              <span className={`${styles.costVal} ${styles.highlight}`}>{selectedCost}</span>
            </div>
            <div className={styles.costRow}>
              <span className={styles.costLabel}>Edges selected</span>
              <span className={styles.costVal}>
                {selectedEdges.size} / {graph.nodes.length - 1} needed
              </span>
            </div>
            <div className={styles.progressBar}>
              <div
                className={styles.progressFill}
                style={{
                  width: `${Math.min(100, (selectedEdges.size / (graph.nodes.length - 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          {/* Selected Edges List */}
          <div className={styles.selectedList}>
            <h3 className={styles.cardTitle}>Selected Roads</h3>
            {selectedEdges.size === 0 ? (
              <p className={styles.emptyText}>Click on dashed lines to repair roads</p>
            ) : (
              <div className={styles.edgeList}>
                {graph.edges
                  .filter(e => selectedEdges.has(e.id))
                  .sort((a, b) => a.weight - b.weight)
                  .map(edge => (
                    <div
                      key={edge.id}
                      className={styles.edgeItem}
                      onClick={() => toggleEdge(edge.id)}
                    >
                      <span className={styles.edgeRoute}>
                        {getLabel(edge.from)} ↔ {getLabel(edge.to)}
                      </span>
                      <span className={styles.edgeCost}>{edge.weight}</span>
                      <button className={styles.removeBtn}>✕</button>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Error message */}
          {errorMsg && (
            <div className={styles.errorBox}>{errorMsg}</div>
          )}

          {/* Controls */}
          <div className={styles.controls}>
            <button className={styles.submitBtn} onClick={handleSubmit}>
              ✅ Confirm Repairs
            </button>
            <button
              className={`${styles.hintBtn} ${showHint ? styles.active : ''}`}
              onClick={() => setShowHint(v => !v)}
            >
              {showHint ? '🙈 Hide Hint' : '💡 Show Hint'}
            </button>
            <button
              className={`${styles.algoBtn} ${showAlgorithm ? styles.active : ''}`}
              onClick={() => setShowAlgorithm(v => !v)}
            >
              🧮 {showAlgorithm ? 'Hide' : 'Show'} Algorithm
            </button>
            <button className={styles.backBtn} onClick={onBack}>
              ← Back
            </button>
          </div>
        </div>
      </div>

      {/* Algorithm Visualization Panel */}
      {showAlgorithm && (
        <div className={styles.algoPanel}>
          <div className={styles.algoPanelHeader}>
            <h3>🧮 Kruskal&apos;s Algorithm — Step by Step</h3>
            <p className={styles.algoDesc}>
              Sort edges by weight ascending. For each edge: if it connects two separate
              components, add it to MST; otherwise reject (would create cycle).
              Uses <strong>Union-Find</strong> data structure. Complexity: <code>O(E log E)</code>.
            </p>
          </div>
          <div className={styles.stepsContainer}>
            {optimalMST.steps.map((step, i) => (
              <div
                key={i}
                className={`${styles.stepRow} ${step.accepted ? styles.stepAccepted : styles.stepRejected}`}
              >
                <span className={styles.stepNum}>{i + 1}</span>
                <span className={styles.stepIcon}>{step.accepted ? '✅' : '❌'}</span>
                <span className={styles.stepText}>{step.reason}</span>
                <span className={styles.stepCost}>MST cost: {step.totalCostSoFar}</span>
              </div>
            ))}
          </div>
          <div className={styles.algoResult}>
            <strong>Optimal MST Cost: {optimalMST.totalCost}</strong> using{' '}
            {optimalMST.mstEdges.length} edges
          </div>
        </div>
      )}
    </div>
  );
}

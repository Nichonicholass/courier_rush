'use client';
import { useEffect, useRef, useState } from 'react';
import type { GameGraph, GameNode, GameEdge, DeliveryPackage } from '@/types';
import styles from './GameCanvas.module.css';

interface Props {
  graph: GameGraph;
  currentNode: string;
  playerPath: string[];
  optimalPath: string[];
  showOptimal: boolean;
  packages: DeliveryPackage[];
  onNodeClick: (id: string) => void;
  disabled?: boolean;
}

const SVG_W = 900;
const SVG_H = 520;
const NODE_R = 26;

function getEdgeKey(a: string, b: string) {
  return [a, b].sort().join('-');
}

function buildPathEdgeSet(path: string[]): Set<string> {
  const s = new Set<string>();
  for (let i = 0; i < path.length - 1; i++) {
    s.add(getEdgeKey(path[i], path[i + 1]));
  }
  return s;
}

export default function GameCanvas({
  graph, currentNode, playerPath, optimalPath,
  showOptimal, packages, onNodeClick, disabled,
}: Props) {
  const playerEdges  = buildPathEdgeSet(playerPath);
  const optimalEdges = buildPathEdgeSet(optimalPath);

  const getNode = (id: string): GameNode | undefined =>
    graph.nodes.find((n) => n.id === id);

  // Courier animation: smoothly tween between last two positions
  const [courierPos, setCourierPos] = useState({ x: 0, y: 0 });
  const animRef = useRef<ReturnType<typeof requestAnimationFrame> | null>(null);

  useEffect(() => {
    const node = getNode(currentNode);
    if (!node) return;
    const target = { x: node.x, y: node.y };

    let start: number | null = null;
    const DURATION = 350; // ms
    const from = { ...courierPos };

    const step = (ts: number) => {
      if (!start) start = ts;
      const t = Math.min((ts - start) / DURATION, 1);
      // ease-in-out
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      setCourierPos({
        x: from.x + (target.x - from.x) * ease,
        y: from.y + (target.y - from.y) * ease,
      });
      if (t < 1) animRef.current = requestAnimationFrame(step);
    };

    animRef.current = requestAnimationFrame(step);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    // only react to currentNode changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentNode]);

  // Initialise courier pos on first graph load
  useEffect(() => {
    const node = getNode('W');
    if (node) setCourierPos({ x: node.x, y: node.y });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graph]);

  const edgeColor = (edge: GameEdge): string => {
    if (edge.blocked) return '#ef4444';
    if (edge.slowed) return '#f97316';
    const key = getEdgeKey(edge.from, edge.to);
    if (showOptimal && optimalEdges.has(key) && playerEdges.has(key)) return '#a78bfa';
    if (showOptimal && optimalEdges.has(key)) return '#22c55e';
    if (playerEdges.has(key)) return '#60a5fa';
    return '#334155';
  };

  const edgeWidth = (edge: GameEdge): number => {
    const key = getEdgeKey(edge.from, edge.to);
    if (playerEdges.has(key) || (showOptimal && optimalEdges.has(key))) return 4;
    return 2;
  };

  const nodeColor = (node: GameNode): string => {
    if (node.id === currentNode) return '#f7971e';
    if (node.type === 'warehouse') return '#6366f1';
    const pkg = packages.find((p) => p.destination === node.id);
    if (pkg?.delivered) return '#22c55e';
    if (pkg) return pkg.priority === 'urgent' ? '#ef4444' : '#f59e0b';
    return '#1e293b';
  };

  const nodeBorder = (node: GameNode): string => {
    if (node.id === currentNode) return '#ffd200';
    if (node.type === 'warehouse') return '#818cf8';
    const pkg = packages.find((p) => p.destination === node.id);
    if (pkg?.delivered) return '#4ade80';
    if (pkg) return pkg.priority === 'urgent' ? '#fca5a5' : '#fde68a';
    return '#475569';
  };

  const nodeLabel = (node: GameNode): string => {
    if (node.type === 'warehouse') return '🏭';
    const pkg = packages.find((p) => p.destination === node.id);
    if (pkg?.delivered) return '✓';
    if (pkg) return pkg.priority === 'urgent' ? '⚡' : '📦';
    return node.id;
  };

  // Midpoint of edge for weight label
  const edgeMid = (e: GameEdge) => {
    const a = getNode(e.from);
    const b = getNode(e.to);
    if (!a || !b) return { x: 0, y: 0 };
    return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="#475569" />
          </marker>
        </defs>

        {/* ── Edges ── */}
        {graph.edges.map((edge) => {
          const a = getNode(edge.from);
          const b = getNode(edge.to);
          if (!a || !b) return null;
          const mid = edgeMid(edge);
          const key = getEdgeKey(edge.from, edge.to);
          const isHighlighted = playerEdges.has(key) || (showOptimal && optimalEdges.has(key));
          return (
            <g key={edge.id}>
              <line
                x1={a.x} y1={a.y} x2={b.x} y2={b.y}
                stroke={edgeColor(edge)}
                strokeWidth={edgeWidth(edge)}
                strokeDasharray={edge.blocked ? '8 4' : edge.slowed ? '4 3' : undefined}
                filter={isHighlighted ? 'url(#glow)' : undefined}
                strokeLinecap="round"
              />
              {/* Weight label */}
              <rect
                x={mid.x - 14} y={mid.y - 10}
                width={28} height={20} rx={4}
                fill="#0f172a" stroke="#334155" strokeWidth={1}
              />
              <text
                x={mid.x} y={mid.y + 4}
                textAnchor="middle"
                fontSize={11}
                fill={edge.blocked ? '#ef4444' : edge.slowed ? '#f97316' : '#94a3b8'}
                fontWeight="600"
              >
                {edge.blocked ? '✗' : edge.slowed ? `${edge.weight}×2` : edge.weight}
              </text>
            </g>
          );
        })}

        {/* ── Nodes ── */}
        {graph.nodes.map((node) => {
          const isCurrent = node.id === currentNode;
          return (
            <g
              key={node.id}
              className={`${styles.nodeGroup} ${disabled ? styles.disabled : ''}`}
              onClick={() => !disabled && onNodeClick(node.id)}
            >
              {/* Pulse ring for current node */}
              {isCurrent && (
                <circle
                  cx={node.x} cy={node.y} r={NODE_R + 8}
                  fill="none"
                  stroke="#ffd200"
                  strokeWidth={2}
                  opacity={0.5}
                  className={styles.pulse}
                />
              )}
              <circle
                cx={node.x} cy={node.y} r={NODE_R}
                fill={nodeColor(node)}
                stroke={nodeBorder(node)}
                strokeWidth={2.5}
                filter={isCurrent ? 'url(#glow)' : undefined}
              />
              {/* Node icon / letter */}
              <text
                x={node.x} y={node.y + 5}
                textAnchor="middle"
                fontSize={node.type === 'warehouse' ? 16 : 14}
                fill="#fff"
                fontWeight="700"
                style={{ userSelect: 'none', pointerEvents: 'none' }}
              >
                {nodeLabel(node)}
              </text>
              {/* Node name label below */}
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
          );
        })}

        {/* ── Courier ── */}
        <g transform={`translate(${courierPos.x}, ${courierPos.y - NODE_R - 14})`}>
          <circle r={14} fill="#f7971e" stroke="#ffd200" strokeWidth={2} filter="url(#glow)" />
          <text textAnchor="middle" y={5} fontSize={14} style={{ userSelect: 'none' }}>🚚</text>
        </g>

        {/* ── Legend ── */}
        <g transform="translate(10, 10)">
          {[
            { color: '#60a5fa', label: 'Your route' },
            { color: '#22c55e', label: 'Optimal route' },
            { color: '#a78bfa', label: 'Overlap' },
            { color: '#ef4444', label: 'Blocked' },
            { color: '#f97316', label: 'Slow traffic' },
          ].map(({ color, label }, i) => (
            <g key={label} transform={`translate(0, ${i * 20})`}>
              <rect width={16} height={5} y={4} rx={2} fill={color} />
              <text x={22} y={12} fontSize={10} fill="#94a3b8">{label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

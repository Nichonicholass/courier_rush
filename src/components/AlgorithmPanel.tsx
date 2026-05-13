'use client';
import { useState, useMemo } from 'react';
import { dijkstra } from '@/algorithms/dijkstra';
import type { GameGraph, OptimalRoute } from '@/types';
import styles from './AlgorithmPanel.module.css';

interface Props {
  graph: GameGraph;
  optimalRoute: OptimalRoute | null;
}

export default function AlgorithmPanel({ graph, optimalRoute }: Props) {
  const [selectedSource, setSelectedSource] = useState<string>('W');
  const [expanded, setExpanded] = useState(false);

  const result = useMemo(() => {
    const nodeIds = graph.nodes.map((n) => n.id);
    if (nodeIds.length === 0) return null;
    return dijkstra(nodeIds, graph.edges, selectedSource);
  }, [graph, selectedSource]);

  const getLabel = (id: string) => graph.nodes.find((n) => n.id === id)?.label ?? id;

  return (
    <div className={styles.panel}>
      <button className={styles.header} onClick={() => setExpanded((v) => !v)}>
        <span>🧮 Dijkstra Algorithm Visualizer</span>
        <span className={styles.chevron}>{expanded ? '▲' : '▼'}</span>
      </button>

      {expanded && (
        <div className={styles.body}>
          <div className={styles.sourceRow}>
            <label className={styles.sourceLabel}>Source node:</label>
            <select
              className={styles.select}
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
            >
              {graph.nodes.map((n) => (
                <option key={n.id} value={n.id}>{n.label} ({n.id})</option>
              ))}
            </select>
          </div>

          {/* Distance table */}
          {result && (
            <div className={styles.tableWrap}>
              <h4 className={styles.subTitle}>Shortest distances from {getLabel(selectedSource)}</h4>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Node</th>
                    <th>Distance</th>
                    <th>Via</th>
                  </tr>
                </thead>
                <tbody>
                  {graph.nodes.map((node) => {
                    const dist = result.distances.get(node.id) ?? Infinity;
                    const prev = result.previous.get(node.id);
                    return (
                      <tr key={node.id}>
                        <td>{node.label} <span className={styles.nodeId}>({node.id})</span></td>
                        <td className={dist === Infinity ? styles.inf : styles.distVal}>
                          {dist === Infinity ? '∞' : dist}
                        </td>
                        <td className={styles.via}>
                          {prev ? getLabel(prev) : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Step-by-step */}
          {result && result.steps.length > 0 && (
            <div className={styles.steps}>
              <h4 className={styles.subTitle}>Algorithm steps</h4>
              <div className={styles.stepList}>
                {result.steps.map((step, i) => (
                  <div key={i} className={styles.step}>
                    <span className={styles.stepNum}>Step {i + 1}</span>
                    <span className={styles.stepDesc}>{step.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Optimal route summary */}
          {optimalRoute && (
            <div className={styles.optimal}>
              <h4 className={styles.subTitle}>Optimal Delivery Route</h4>
              <div className={styles.routeOrder}>
                {optimalRoute.order.map((id, i) => (
                  <span key={i} className={styles.routeNode}>
                    {getLabel(id)}
                    {i < optimalRoute.order.length - 1 && (
                      <span className={styles.arrow}>→</span>
                    )}
                  </span>
                ))}
              </div>
              <p className={styles.routeDist}>
                Total optimal distance: <strong>{optimalRoute.totalDistance}</strong>
              </p>
            </div>
          )}

          <div className={styles.note}>
            <strong>Algorithm:</strong> Dijkstra&apos;s — O(V²) with linear scan for minimum.
            Multi-stop ordering uses <em>Greedy Nearest Neighbor</em> on the APSP matrix.
          </div>
        </div>
      )}
    </div>
  );
}

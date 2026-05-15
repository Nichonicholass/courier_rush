'use client';
import { useState } from 'react';
import type { GameResult, MSTResult, GameGraph, DeliveryPackage } from '@/types';
import GameCanvas from './GameCanvas';
import styles from './ResultScreen.module.css';

interface Props {
  result: GameResult;
  mstResult?: MSTResult | null;
  graph: GameGraph;
  packages: DeliveryPackage[];
  onSaveScore: (name: string) => void;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function ResultScreen({ result, mstResult, graph, packages, onSaveScore, onPlayAgain, onMenu }: Props) {
  const [name, setName] = useState('');
  const [saved, setSaved] = useState(false);

  const { playerDistance, optimalRoute, efficiency, score, timeElapsed, difficulty, allDelivered } = result;
  const formattedTime = new Date(timeElapsed).toISOString().substr(14, 5);

  const grade =
    efficiency >= 95 ? { label: 'S', color: '#ffd700' } :
    efficiency >= 85 ? { label: 'A', color: '#4ade80' } :
    efficiency >= 70 ? { label: 'B', color: '#60a5fa' } :
    efficiency >= 55 ? { label: 'C', color: '#f59e0b' } :
                       { label: 'D', color: '#f87171' };

  const handleSave = () => {
    if (saved) return;
    onSaveScore(name);
    setSaved(true);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.gradeCircle} style={{ borderColor: grade.color, color: grade.color }}>
          {grade.label}
        </div>

        <h2 className={styles.title}>
          {allDelivered ? '🎉 All Packages Delivered!' : '😔 Game Over'}
        </h2>

        <div className={styles.scoreRow}>
          <span className={styles.scoreLabel}>Final Score</span>
          <div className={styles.scoreValWrap}>
            <span className={styles.scoreVal}>{score}</span>
            {mstResult && mstResult.bonusScore > 0 && (
              <span className={styles.bonusTag}>+{mstResult.bonusScore} MST</span>
            )}
          </div>
        </div>

        {/* Visual Map (Full Width) */}
        <div className={styles.mapCol}>
          <h3 className={styles.compTitle}>Visual Route Comparison</h3>
          <div className={styles.mapWrapper}>
            <GameCanvas
              graph={graph}
              currentNode={result.playerPath[result.playerPath.length - 1]}
              playerPath={result.playerPath}
              optimalPath={result.optimalRoute.order}
              showOptimal={true}
              packages={packages.map(p => ({ ...p, delivered: true }))}
              onNodeClick={() => {}}
              hideLegend={true}
              disabled={true}
            />
          </div>
          <div className={styles.mapLegend}>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ background: '#60a5fa' }} />
              Your Route
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{ background: '#34d399' }} />
              Dijkstra&apos;s Optimal
            </div>
          </div>
        </div>

        <div className={styles.contentGrid}>
          {/* Left Column: MST Stats & Save */}
          <div className={styles.statsCol}>
            {mstResult && (
              <div className={styles.comparison}>
                <h3 className={styles.compTitle}>🔧 Road Repair (Kruskal&apos;s MST)</h3>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>Metric</th>
                      <th>You</th>
                      <th>Optimal</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Repair Cost</td>
                      <td className={styles.playerVal}>{mstResult.playerCost}</td>
                      <td className={styles.optVal}>{mstResult.optimalCost}</td>
                    </tr>
                    <tr>
                      <td>Efficiency</td>
                      <td className={
                        mstResult.efficiency >= 90 ? styles.great :
                        mstResult.efficiency >= 70 ? styles.ok : styles.poor
                      }>
                        {mstResult.efficiency}%
                      </td>
                      <td className={styles.optVal}>100%</td>
                    </tr>
                    <tr>
                      <td>Valid Tree?</td>
                      <td>{mstResult.isValid ? '✅ Yes' : '⚠️ No'}</td>
                      <td className={styles.optVal}>✅ Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
            
            <div className={styles.actionsBlock}>
              {!saved ? (
                <div className={styles.saveRow}>
                  <input
                    className={styles.nameInput}
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={20}
                    onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                  />
                  <button className={styles.saveBtn} onClick={handleSave}>
                    Save Score
                  </button>
                </div>
              ) : (
                <p className={styles.savedMsg}>✅ Score saved to leaderboard!</p>
              )}

              <div className={styles.actions}>
                <button className={styles.againBtn} onClick={onPlayAgain}>
                  Play Again
                </button>
                <button className={styles.menuBtn} onClick={onMenu}>
                  Main Menu
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dijkstra Stats */}
          <div className={styles.statsCol}>
            <div className={styles.comparison}>
              <h3 className={styles.compTitle}>🚚 Delivery Route (Dijkstra)</h3>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>You</th>
                    <th>Dijkstra</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total Distance</td>
                    <td className={styles.playerVal}>{playerDistance}</td>
                    <td className={styles.optVal}>{optimalRoute.totalDistance}</td>
                  </tr>
                  <tr>
                    <td>Efficiency</td>
                    <td
                      className={
                        efficiency >= 90 ? styles.great :
                        efficiency >= 70 ? styles.ok : styles.poor
                      }
                    >
                      {Math.round(efficiency)}%
                    </td>
                    <td className={styles.optVal}>100%</td>
                  </tr>
                  <tr>
                    <td>Time</td>
                    <td className={styles.playerVal}>{formattedTime}</td>
                    <td className={styles.optVal}>—</td>
                  </tr>
                  <tr>
                    <td>Difficulty</td>
                    <td className={styles[difficulty]}>{difficulty}</td>
                    <td className={styles.optVal}>—</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>




  );
}

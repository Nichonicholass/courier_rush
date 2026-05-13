'use client';
import { useState } from 'react';
import type { GameResult } from '@/types';
import styles from './ResultScreen.module.css';

interface Props {
  result: GameResult;
  onSaveScore: (name: string) => void;
  onPlayAgain: () => void;
  onMenu: () => void;
}

export default function ResultScreen({ result, onSaveScore, onPlayAgain, onMenu }: Props) {
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
          {allDelivered ? '🎉 All Packages Delivered!' : '⏹ Game Over'}
        </h2>

        <div className={styles.scoreRow}>
          <span className={styles.scoreLabel}>Final Score</span>
          <span className={styles.scoreVal}>{score}</span>
        </div>

        {/* Comparison Table */}
        <div className={styles.comparison}>
          <h3 className={styles.compTitle}>Route Comparison</h3>
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

        {/* Optimal path detail */}
        <div className={styles.pathDetail}>
          <p className={styles.pathLabel}>Dijkstra&apos;s Optimal Route:</p>
          <div className={styles.pathNodes}>
            {optimalRoute.order.map((id, i) => (
              <span key={i} className={styles.pathNode}>
                {id}
                {i < optimalRoute.order.length - 1 && <span className={styles.arrow}>→</span>}
              </span>
            ))}
          </div>
          <p className={styles.pathLabel}>Total: {optimalRoute.totalDistance} units</p>
        </div>

        {/* Player route detail */}
        <div className={styles.pathDetail}>
          <p className={styles.pathLabel}>Your Route:</p>
          <div className={styles.pathNodes}>
            {result.playerPath.map((id, i) => (
              <span key={i} className={styles.pathNodePlayer}>
                {id}
                {i < result.playerPath.length - 1 && <span className={styles.arrow}>→</span>}
              </span>
            ))}
          </div>
          <p className={styles.pathLabel}>Total: {playerDistance} units</p>
        </div>

        {/* Save score */}
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
  );
}

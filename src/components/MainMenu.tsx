'use client';
import { useState } from 'react';
import type { LeaderboardEntry } from '@/types';
import styles from './MainMenu.module.css';

interface Props {
  onStart: () => void;
  leaderboard: LeaderboardEntry[];
  onClearLeaderboard: () => void;
}

export default function MainMenu({ onStart, leaderboard, onClearLeaderboard }: Props) {
  const [showBoard, setShowBoard] = useState(false);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.icon}>🚚</div>
        <h1 className={styles.title}>Courier Rush</h1>
        <p className={styles.subtitle}>
          Navigate the city graph. Deliver all packages. Beat the algorithm.
        </p>

        <div className={styles.algorithmBadge}>
          <span className={styles.badgeLabel}>Algorithm</span>
          <span className={styles.badgeName}>Dijkstra&apos;s Shortest Path</span>
        </div>

        <div className={styles.buttons}>
          <button className={styles.startBtn} onClick={onStart}>
            Start Game
          </button>
          <button
            className={styles.boardBtn}
            onClick={() => setShowBoard((v) => !v)}
          >
            {showBoard ? 'Hide' : 'Leaderboard'}
          </button>
        </div>
      </div>

      {showBoard && (
        <div className={styles.leaderboard}>
          <div className={styles.boardHeader}>
            <h2>Top Scores</h2>
            <button className={styles.clearBtn} onClick={onClearLeaderboard}>
              Clear
            </button>
          </div>
          {leaderboard.length === 0 ? (
            <p className={styles.empty}>No scores yet. Play a game first!</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Score</th>
                  <th>Efficiency</th>
                  <th>Difficulty</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((e, i) => (
                  <tr key={e.id}>
                    <td>{i + 1}</td>
                    <td>{e.name}</td>
                    <td className={styles.scoreCell}>{e.score}</td>
                    <td>{e.efficiency}%</td>
                    <td className={styles[e.difficulty]}>{e.difficulty}</td>
                    <td>{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className={styles.howToPlay}>
        <h3>How to Play</h3>
        <ul>
          <li>Click adjacent nodes on the map to move your courier</li>
          <li>Deliver all packages to marked destinations</li>
          <li>Try to match or beat Dijkstra&apos;s optimal route</li>
          <li>Your score is based on distance efficiency + time</li>
        </ul>
      </div>
    </div>
  );
}

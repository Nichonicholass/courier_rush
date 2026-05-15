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
      <div className={styles.glow1} />
      <div className={styles.glow2} />

      <div className={styles.hero}>
        <div className={styles.icon}>🚚</div>
        <h1 className={styles.title}>Courier Rush</h1>
        <p className={styles.subtitle}>
          Navigate the city graph · Repair roads · Deliver packages · Beat the algorithm
        </p>

        <div className={styles.badges}>
          <div className={styles.badge}>
            <span className={styles.badgeNum}>01</span>
            <span className={styles.badgeName}>Kruskal&apos;s MST</span>
          </div>
          <div className={styles.badgeDivider}>→</div>
          <div className={styles.badge}>
            <span className={styles.badgeNum}>02</span>
            <span className={styles.badgeName}>Dijkstra&apos;s Shortest Path</span>
          </div>
        </div>

        <div className={styles.buttons}>
          <button className={styles.primaryBtn} onClick={onStart}>
            Start Game
          </button>
          <button
            className={styles.secondaryBtn}
            onClick={() => setShowBoard((v) => !v)}
          >
            {showBoard ? 'Hide Board' : '🏆 Leaderboard'}
          </button>
        </div>
      </div>

      {showBoard && (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}>🏆 Leaderboard</h2>
            <button className={styles.dangerBtn} onClick={onClearLeaderboard}>
              Clear All
            </button>
          </div>
          {leaderboard.length === 0 ? (
            <p className={styles.emptyText}>No scores yet. Play a game first!</p>
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
                    <td>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}</td>
                    <td>{e.name}</td>
                    <td className={styles.accent}>{e.score}</td>
                    <td>{e.efficiency}%</td>
                    <td><span className={`${styles.diffTag} ${styles[e.difficulty]}`}>{e.difficulty}</span></td>
                    <td className={styles.muted}>{e.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <div className={styles.panel} style={{ maxWidth: 520 }}>
        <h3 className={styles.panelTitle}>How to Play</h3>
        <ul className={styles.rulesList}>
          <li><strong>Phase 1 — Road Repair:</strong> Select damaged roads to rebuild using Kruskal&apos;s MST</li>
          <li><strong>Phase 2 — Delivery:</strong> Click adjacent nodes to move your courier</li>
          <li><strong>Goal:</strong> Deliver all packages as efficiently as Dijkstra&apos;s algorithm</li>
          <li><strong>Score:</strong> Based on MST efficiency + route distance + speed</li>
        </ul>
      </div>
    </div>
  );
}

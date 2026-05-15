'use client';
import type { Difficulty } from '@/types';
import styles from './DifficultySelect.module.css';

interface Props {
  onSelect: (d: Difficulty) => void;
  onBack: () => void;
}

const LEVELS: { difficulty: Difficulty; label: string; nodes: number; deliveries: number; desc: string; icon: string }[] = [
  { difficulty: 'easy',   label: 'Easy',   nodes: 5,  deliveries: 3, desc: 'Simple city layout. Great for learning.', icon: '🌱' },
  { difficulty: 'medium', label: 'Medium', nodes: 8,  deliveries: 4, desc: 'More nodes, trickier MST decisions.', icon: '⚡' },
  { difficulty: 'hard',   label: 'Hard',   nodes: 12, deliveries: 5, desc: 'Complex network. Can you beat both algorithms?', icon: '🔥' },
];

export default function DifficultySelect({ onSelect, onBack }: Props) {
  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Select Difficulty</h2>
      <p className={styles.hint}>More nodes = harder to match the optimal MST &amp; route</p>

      <div className={styles.cards}>
        {LEVELS.map(({ difficulty, label, nodes, deliveries, desc, icon }) => (
          <button
            key={difficulty}
            className={`${styles.card} ${styles[difficulty]}`}
            onClick={() => onSelect(difficulty)}
          >
            <span className={styles.cardIcon}>{icon}</span>
            <span className={styles.cardName}>{label}</span>
            <span className={styles.cardDesc}>{desc}</span>
            <div className={styles.cardStats}>
              <span>{nodes} nodes</span>
              <span className={styles.dot}>·</span>
              <span>{deliveries} deliveries</span>
            </div>
          </button>
        ))}
      </div>

      <button className={styles.backBtn} onClick={onBack}>
        ← Back to Menu
      </button>
    </div>
  );
}

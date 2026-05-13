'use client';
import type { Difficulty } from '@/types';
import styles from './DifficultySelect.module.css';

interface Props {
  onSelect: (d: Difficulty) => void;
  onBack: () => void;
}

const LEVELS: { difficulty: Difficulty; label: string; nodes: number; deliveries: number; desc: string }[] = [
  { difficulty: 'easy',   label: 'Easy',   nodes: 5,  deliveries: 3, desc: 'Simple city layout. Great for learning.' },
  { difficulty: 'medium', label: 'Medium', nodes: 8,  deliveries: 4, desc: 'Larger map with more route choices.' },
  { difficulty: 'hard',   label: 'Hard',   nodes: 12, deliveries: 5, desc: 'Complex network. Dijkstra shines here.' },
];

export default function DifficultySelect({ onSelect, onBack }: Props) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Select Difficulty</h2>
      <p className={styles.hint}>More nodes = harder to beat Dijkstra&apos;s optimal route</p>

      <div className={styles.cards}>
        {LEVELS.map(({ difficulty, label, nodes, deliveries, desc }) => (
          <button
            key={difficulty}
            className={`${styles.card} ${styles[difficulty]}`}
            onClick={() => onSelect(difficulty)}
          >
            <span className={styles.emoji}>
              {difficulty === 'easy' ? '🟢' : difficulty === 'medium' ? '🟡' : '🔴'}
            </span>
            <span className={styles.name}>{label}</span>
            <span className={styles.desc}>{desc}</span>
            <div className={styles.stats}>
              <span>{nodes} nodes</span>
              <span>·</span>
              <span>{deliveries} deliveries</span>
            </div>
          </button>
        ))}
      </div>

      <button className={styles.back} onClick={onBack}>
        ← Back to Menu
      </button>
    </div>
  );
}

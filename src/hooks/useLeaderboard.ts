import { useState, useEffect, useCallback } from 'react';
import type { LeaderboardEntry, Difficulty } from '@/types';

const STORAGE_KEY = 'courier-rush-leaderboard';

export function useLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setEntries(JSON.parse(raw));
    } catch {
      // ignore
    }
  }, []);

  const addEntry = useCallback(
    (name: string, score: number, difficulty: Difficulty, efficiency: number, timeElapsed: number) => {
      const entry: LeaderboardEntry = {
        id: crypto.randomUUID(),
        name: name.trim() || 'Anonymous',
        score,
        difficulty,
        efficiency: Math.round(efficiency),
        timeElapsed,
        date: new Date().toLocaleDateString(),
      };
      setEntries((prev) => {
        const next = [...prev, entry]
          .sort((a, b) => b.score - a.score)
          .slice(0, 10);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    []
  );

  const clearEntries = useCallback(() => {
    setEntries([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  const getTopEntries = useCallback(
    (difficulty?: Difficulty) =>
      difficulty ? entries.filter((e) => e.difficulty === difficulty) : entries,
    [entries]
  );

  return { entries, addEntry, clearEntries, getTopEntries };
}

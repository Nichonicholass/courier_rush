'use client';
import { useEffect, useCallback } from 'react';
import MainMenu from '@/components/MainMenu';
import DifficultySelect from '@/components/DifficultySelect';
import GameScreen from '@/components/GameScreen';
import ResultScreen from '@/components/ResultScreen';
import { useGame } from '@/hooks/useGame';
import { useTimer } from '@/hooks/useTimer';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { Difficulty } from '@/types';

export default function Home() {
  const timer = useTimer();
  const leaderboard = useLeaderboard();
  const game = useGame();

  // Pause timer automatically when game ends
  useEffect(() => {
    if (game.phase === 'result' && timer.running) {
      timer.pause();
    }
  }, [game.phase, timer]);

  const handleStart = useCallback((diff: Difficulty) => {
    timer.reset();
    game.startGame(diff);
    // Timer starts after state settles
    setTimeout(() => timer.start(), 0);
  }, [game, timer]);

  const handleNodeClick = useCallback((id: string) => {
    game.moveToNode(id, timer.elapsed);
  }, [game, timer]);

  const handleGiveUp = useCallback(() => {
    timer.pause();
    game.giveUp(timer.elapsed);
  }, [game, timer]);

  const handleSaveScore = useCallback((name: string) => {
    if (!game.result) return;
    leaderboard.addEntry(
      name,
      game.result.score,
      game.result.difficulty,
      game.result.efficiency,
      game.result.timeElapsed,
    );
  }, [game.result, leaderboard]);

  const handlePlayAgain = useCallback(() => {
    timer.reset();
    game.setPhase('difficulty');
  }, [game, timer]);

  return (
    <>
      {game.phase === 'menu' && (
        <MainMenu
          onStart={() => game.setPhase('difficulty')}
          leaderboard={leaderboard.entries}
          onClearLeaderboard={leaderboard.clearEntries}
        />
      )}

      {game.phase === 'difficulty' && (
        <DifficultySelect
          onSelect={handleStart}
          onBack={() => game.setPhase('menu')}
        />
      )}

      {game.phase === 'playing' && (
        <GameScreen
          graph={game.graph}
          currentNode={game.currentNode}
          playerPath={game.playerPath}
          playerDistance={game.playerDistance}
          packages={game.packages}
          events={game.events}
          optimalRoute={game.optimalRoute}
          showOptimal={game.showOptimal}
          message={game.message}
          formattedTime={timer.formatTime(timer.elapsed)}
          onNodeClick={handleNodeClick}
          onGiveUp={handleGiveUp}
          onTriggerEvent={game.triggerRandomEvent}
          onShowOptimal={game.toggleShowOptimal}
        />
      )}

      {game.phase === 'result' && game.result && (
        <ResultScreen
          result={game.result}
          onSaveScore={handleSaveScore}
          onPlayAgain={handlePlayAgain}
          onMenu={game.goToMenu}
        />
      )}
    </>
  );
}

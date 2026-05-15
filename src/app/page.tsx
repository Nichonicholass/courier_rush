'use client';
import { useEffect, useCallback, useState, useRef } from 'react';
import MainMenu from '@/components/MainMenu';
import DifficultySelect from '@/components/DifficultySelect';
import MSTPhase from '@/components/MSTPhase';
import GameScreen from '@/components/GameScreen';
import ResultScreen from '@/components/ResultScreen';
import { useGame } from '@/hooks/useGame';
import { useTimer } from '@/hooks/useTimer';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import type { Difficulty, MSTResult } from '@/types';

export default function Home() {
  const timer = useTimer();
  const leaderboard = useLeaderboard();
  const game = useGame();
  const [mstResult, setMstResult] = useState<MSTResult | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (game.phase !== 'menu' && audioRef.current && !isMuted) {
      audioRef.current.play().catch(() => {});
    }
  }, [game.phase, isMuted]);

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play().catch(() => {});
      } else {
        audioRef.current.pause();
      }
    }
    setIsMuted(!isMuted);
  };

  // Pause timer automatically when game ends
  useEffect(() => {
    if (game.phase === 'result' && timer.running) {
      timer.pause();
    }
  }, [game.phase, timer]);

  const handleSelectDifficulty = useCallback((diff: Difficulty) => {
    // Initialize graph for MST phase first
    game.initGraph(diff);
  }, [game]);

  const handleMSTComplete = useCallback((result: MSTResult) => {
    setMstResult(result);
    // Start the delivery game after MST phase
    timer.reset();
    game.startGameAfterMST(result);
    setTimeout(() => timer.start(), 0);
  }, [game, timer]);

  const handleSkipMST = useCallback(() => {
    setMstResult(null);
    timer.reset();
    game.startGameSkipMST();
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
    setMstResult(null);
    game.setPhase('difficulty');
  }, [game, timer]);

  return (
    <>
      <audio ref={audioRef} src="/bgm.mp3" loop />
      <button 
        onClick={toggleMute} 
        style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000, background: '#0d1117', border: '1px solid #161f2e', color: '#f0c040', padding: '10px 15px', borderRadius: '50px', cursor: 'pointer', fontWeight: 'bold' }}
      >
        {isMuted ? '🔇 Music Off' : '🔊 Music On'}
      </button>

      {game.phase === 'menu' && (
        <MainMenu
          onStart={() => game.setPhase('difficulty')}
          leaderboard={leaderboard.entries}
          onClearLeaderboard={leaderboard.clearEntries}
        />
      )}

      {game.phase === 'difficulty' && (
        <DifficultySelect
          onSelect={handleSelectDifficulty}
          onBack={() => game.setPhase('menu')}
        />
      )}

      {game.phase === 'mst' && (
        <MSTPhase
          graph={game.graph}
          onComplete={handleMSTComplete}
          onBack={() => game.setPhase('difficulty')}
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
          mstResult={mstResult}
          onNodeClick={handleNodeClick}
          onGiveUp={handleGiveUp}
          onTriggerEvent={game.triggerRandomEvent}
          onShowOptimal={game.toggleShowOptimal}
        />
      )}

      {game.phase === 'result' && game.result && (
        <ResultScreen
          result={game.result}
          mstResult={mstResult}
          graph={game.graph}
          packages={game.packages}
          onSaveScore={handleSaveScore}
          onPlayAgain={handlePlayAgain}
          onMenu={game.goToMenu}
        />
      )}
    </>
  );
}

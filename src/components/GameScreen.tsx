'use client';
import GameCanvas from './GameCanvas';
import Dashboard from './Dashboard';
import AlgorithmPanel from './AlgorithmPanel';
import type { GameGraph, DeliveryPackage, TrafficEvent, OptimalRoute, MSTResult } from '@/types';
import styles from './GameScreen.module.css';

interface Props {
  graph: GameGraph;
  currentNode: string;
  playerPath: string[];
  playerDistance: number;
  packages: DeliveryPackage[];
  events: TrafficEvent[];
  optimalRoute: OptimalRoute | null;
  showOptimal: boolean;
  message: string;
  formattedTime: string;
  mstResult?: MSTResult | null;
  onNodeClick: (id: string) => void;
  onGiveUp: () => void;
  onTriggerEvent: () => void;
  onShowOptimal: () => void;
}

export default function GameScreen({
  graph, currentNode, playerPath, playerDistance,
  packages, events, optimalRoute, showOptimal,
  message, formattedTime, mstResult,
  onNodeClick, onGiveUp, onTriggerEvent, onShowOptimal,
}: Props) {
  const optimalPath = optimalRoute?.order ?? [];

  return (
    <div className={styles.layout}>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className={styles.logo}>🚚 Courier Rush</div>
        {mstResult && (
          <div className={styles.mstBadge}>
            🔧 MST Bonus: +{mstResult.bonusScore} pts ({mstResult.efficiency}%)
          </div>
        )}
        <div className={styles.deliveryCount}>
          {packages.filter((p) => p.delivered).length}/{packages.length} Delivered
        </div>
      </div>

      {/* Main area */}
      <div className={styles.main}>
        <GameCanvas
          graph={graph}
          currentNode={currentNode}
          playerPath={playerPath}
          optimalPath={showOptimal ? optimalPath : []}
          showOptimal={showOptimal}
          packages={packages}
          onNodeClick={onNodeClick}
        />
        <Dashboard
          currentNode={currentNode}
          graph={graph}
          packages={packages}
          playerPath={playerPath}
          playerDistance={playerDistance}
          optimalRoute={optimalRoute}
          events={events}
          message={message}
          formattedTime={formattedTime}
          onGiveUp={onGiveUp}
          onTriggerEvent={onTriggerEvent}
          onShowOptimal={onShowOptimal}
          showOptimal={showOptimal}
        />
      </div>

      {/* Algorithm panel at bottom */}
      <div className={styles.bottom}>
        <AlgorithmPanel graph={graph} optimalRoute={optimalRoute} />
      </div>
    </div>
  );
}

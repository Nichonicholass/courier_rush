'use client';
import type { DeliveryPackage, TrafficEvent, OptimalRoute, GameGraph } from '@/types';
import styles from './Dashboard.module.css';

interface Props {
  currentNode: string;
  graph: GameGraph;
  packages: DeliveryPackage[];
  playerPath: string[];
  playerDistance: number;
  optimalRoute: OptimalRoute | null;
  events: TrafficEvent[];
  message: string;
  formattedTime: string;
  onGiveUp: () => void;
  onTriggerEvent: () => void;
  onShowOptimal: () => void;
  showOptimal: boolean;
}

export default function Dashboard({
  currentNode, graph, packages, playerPath, playerDistance,
  optimalRoute, events, message, formattedTime,
  onGiveUp, onTriggerEvent, onShowOptimal, showOptimal,
}: Props) {
  const currentLabel = graph.nodes.find((n) => n.id === currentNode)?.label ?? currentNode;
  const deliveredCount = packages.filter((p) => p.delivered).length;
  const totalPackages = packages.length;
  const efficiency = optimalRoute
    ? Math.min(100, Math.round((optimalRoute.totalDistance / Math.max(playerDistance, 1)) * 100))
    : 100;

  return (
    <div className={styles.panel}>
      {/* Timer + location */}
      <div className={styles.topRow}>
        <div className={styles.timerBox}>
          <span className={styles.timerIcon}>⏱</span>
          <span className={styles.timerVal}>{formattedTime}</span>
        </div>
        <div className={styles.location}>
          📍 <strong>{currentLabel}</strong>
        </div>
      </div>

      {/* Message toast */}
      {message && <div className={styles.toast}>{message}</div>}

      {/* Traffic events */}
      {events.length > 0 && (
        <div className={styles.events}>
          {events.map((ev) => (
            <div key={ev.id} className={`${styles.event} ${styles[ev.type]}`}>
              {ev.type === 'blocked' ? '🚧' : '🐌'} {ev.message}
            </div>
          ))}
        </div>
      )}

      {/* Deliveries */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          Deliveries
          <span className={styles.badge}>{deliveredCount}/{totalPackages}</span>
        </h3>
        <div className={styles.packageList}>
          {packages.map((pkg) => {
            const destNode = graph.nodes.find((n) => n.id === pkg.destination);
            return (
              <div
                key={pkg.id}
                className={`${styles.packageItem} ${pkg.delivered ? styles.delivered : ''}`}
              >
                <span className={styles.pkgIcon}>
                  {pkg.delivered ? '✅' : pkg.priority === 'urgent' ? '⚡' : '📦'}
                </span>
                <span className={styles.pkgLabel}>{destNode?.label ?? pkg.destination}</span>
                {pkg.priority === 'urgent' && !pkg.delivered && (
                  <span className={styles.urgent}>URGENT</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Route stats */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Route Stats</h3>
        <div className={styles.statGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Your distance</span>
            <span className={styles.statValue}>{playerDistance}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Optimal distance</span>
            <span className={styles.statValue}>
              {optimalRoute ? optimalRoute.totalDistance : '?'}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Efficiency</span>
            <span
              className={`${styles.statValue} ${
                efficiency >= 90 ? styles.great : efficiency >= 70 ? styles.ok : styles.poor
              }`}
            >
              {playerDistance > 0 ? `${efficiency}%` : '—'}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Hops taken</span>
            <span className={styles.statValue}>{playerPath.length - 1}</span>
          </div>
        </div>
      </div>

      {/* Path trail */}
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Your Path</h3>
        <div className={styles.pathTrail}>
          {playerPath.map((nodeId, i) => {
            const label = graph.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
            return (
              <span key={i} className={styles.pathStep}>
                {label}{i < playerPath.length - 1 ? ' →' : ''}
              </span>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className={styles.controls}>
        <button
          className={`${styles.btn} ${styles.btnOptimal} ${showOptimal ? styles.active : ''}`}
          onClick={onShowOptimal}
        >
          {showOptimal ? '🔵 Hide Optimal' : '🟢 Show Optimal'}
        </button>
        <button className={`${styles.btn} ${styles.btnEvent}`} onClick={onTriggerEvent}>
          🎲 Traffic Event
        </button>
        <button className={`${styles.btn} ${styles.btnGiveUp}`} onClick={onGiveUp}>
          🏁 Finish
        </button>
      </div>
    </div>
  );
}

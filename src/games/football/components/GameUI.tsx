import React from 'react';
import { GameStats } from '../types';
import { formatTime } from '../utils';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameUIProps {
  stats: GameStats;
  gameRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
}

const GameUI: React.FC<GameUIProps> = ({ stats, gameRunning, onStart, onPause, onResume }) => {
  return (
    <div className="game-ui">
      <div className="scoreboard">
        <div className="team-score home">
          <h3>{stats.homeTeam.name}</h3>
          <div className="score">{stats.homeTeam.score}</div>
          <div className="stats-mini">
            <span>Shots: {stats.homeTeam.shots}</span>
            <span>Passes: {stats.homeTeam.passes}</span>
          </div>
        </div>

        <div className="match-info">
          <div className="time">{formatTime(stats.currentTime)}</div>
          <div className="status">{stats.gameState.toUpperCase()}</div>
        </div>

        <div className="team-score away">
          <h3>{stats.awayTeam.name}</h3>
          <div className="score">{stats.awayTeam.score}</div>
          <div className="stats-mini">
            <span>Shots: {stats.awayTeam.shots}</span>
            <span>Passes: {stats.awayTeam.passes}</span>
          </div>
        </div>
      </div>

      <div className="controls">
        {!gameRunning && stats.gameState === 'idle' && (
          <button onClick={onStart} className="btn-control btn-start">
            <Play size={20} /> Start Match
          </button>
        )}
        {gameRunning && (
          <button onClick={onPause} className="btn-control btn-pause">
            <Pause size={20} /> Pause
          </button>
        )}
        {!gameRunning && stats.gameState === 'playing' && (
          <button onClick={onResume} className="btn-control btn-resume">
            <Play size={20} /> Resume
          </button>
        )}
      </div>

      <div className="match-events">
        <h4>Match Events</h4>
        <div className="events-list">
          {stats.actions.slice(-5).reverse().map((action, idx) => (
            <div key={idx} className="event-item">
              <span className="event-time">{formatTime(action.timestamp)}</span>
              <span className="event-type">{action.type}</span>
              <span className={`event-result ${action.success ? 'success' : 'failed'}`}>
                {action.success ? '✓' : '✗'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GameUI;

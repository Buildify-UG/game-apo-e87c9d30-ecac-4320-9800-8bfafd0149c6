import React from 'react';
import { Player } from '../types';
import {
  Zap,
  Target,
  Wind,
  Shield,
  Airplay,
  AlertCircle,
  Trophy,
} from 'lucide-react';

interface ActionPanelProps {
  selectedPlayer: Player | null;
  onAction: (action: string) => void;
  gameRunning: boolean;
}

const ActionPanel: React.FC<ActionPanelProps> = ({ selectedPlayer, onAction, gameRunning }) => {
  if (!selectedPlayer) {
    return (
      <div className="action-panel empty">
        <p>Select a player to perform actions</p>
      </div>
    );
  }

  const actions = [
    { id: 'pass', label: 'Pass', icon: Target, color: 'blue', disabled: selectedPlayer.position === 'GK' },
    { id: 'shoot', label: 'Shoot', icon: Zap, color: 'red', disabled: selectedPlayer.position === 'GK' },
    { id: 'dribble', label: 'Dribble', icon: Wind, color: 'green', disabled: !selectedPlayer.hasBall },
    { id: 'tackle', label: 'Tackle', icon: Shield, color: 'purple', disabled: selectedPlayer.hasBall },
    { id: 'header', label: 'Header', icon: Airplay, color: 'orange', disabled: selectedPlayer.position === 'GK' },
  ];

  return (
    <div className="action-panel">
      <div className="player-info">
        <h3>{selectedPlayer.name}</h3>
        <div className="player-details">
          <span>#{selectedPlayer.number}</span>
          <span>{selectedPlayer.position}</span>
          <span className="stamina">Stamina: {Math.round(selectedPlayer.stamina)}%</span>
        </div>
        {selectedPlayer.hasBall && <div className="has-ball">🏀 HAS BALL</div>}
      </div>

      <div className="actions-grid">
        {actions.map(action => {
          const IconComponent = action.icon;
          const disabled = action.disabled || !gameRunning;

          return (
            <button
              key={action.id}
              onClick={() => !disabled && onAction(action.id)}
              disabled={disabled}
              className={`action-btn action-${action.color} ${disabled ? 'disabled' : ''}`}
              title={disabled ? 'Action not available' : action.label}
            >
              <IconComponent size={24} />
              <span>{action.label}</span>
            </button>
          );
        })}
      </div>

      <div className="player-stats">
        <div className="stat">
          <label>Speed:</label>
          <div className="stat-bar">
            <div
              className="stat-fill"
              style={{ width: `${selectedPlayer.speed}%` }}
            ></div>
          </div>
        </div>
        <div className="stat">
          <label>Skill:</label>
          <div className="stat-bar">
            <div
              className="stat-fill"
              style={{ width: `${selectedPlayer.skill}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionPanel;

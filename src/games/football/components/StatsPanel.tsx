import React from 'react';
import { GameStats } from '../types';

interface StatsPanelProps {
  stats: GameStats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  const homeStats = stats.homeTeam;
  const awayStats = stats.awayTeam;

  const statItems = [
    { label: 'Shots', home: homeStats.shots, away: awayStats.shots },
    { label: 'Shots on Target', home: homeStats.shotsOnTarget, away: awayStats.shotsOnTarget },
    { label: 'Passes', home: homeStats.passes, away: awayStats.passes },
    { label: 'Tackles', home: homeStats.tackles, away: awayStats.tackles },
    { label: 'Fouls', home: homeStats.fouls, away: awayStats.fouls },
  ];

  return (
    <div className="stats-panel">
      <h3>Match Statistics</h3>
      <div className="stats-comparison">
        {statItems.map((item, idx) => (
          <div key={idx} className="stat-row">
            <div className="stat-home">
              <span className="stat-value">{item.home}</span>
            </div>
            <div className="stat-label">{item.label}</div>
            <div className="stat-away">
              <span className="stat-value">{item.away}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="possession-stat">
        <h4>Possession</h4>
        <div className="possession-bar">
          <div
            className="possession-home"
            style={{ width: '50%' }}
          ></div>
          <div
            className="possession-away"
            style={{ width: '50%' }}
          ></div>
        </div>
        <div className="possession-labels">
          <span>50%</span>
          <span>50%</span>
        </div>
      </div>

      <div className="team-lineups">
        <div className="lineup">
          <h4>{homeStats.name}</h4>
          <div className="players-list">
            {homeStats.players.map(player => (
              <div key={player.id} className="player-line">
                <span className="number">#{player.number}</span>
                <span className="name">{player.name}</span>
                <span className="position">{player.position}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lineup">
          <h4>{awayStats.name}</h4>
          <div className="players-list">
            {awayStats.players.map(player => (
              <div key={player.id} className="player-line">
                <span className="number">#{player.number}</span>
                <span className="name">{player.name}</span>
                <span className="position">{player.position}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;

import React, { useEffect, useRef, useState } from 'react';
import { FootballGameEngine } from './GameEngine';
import { GameStats, Player } from './types';
import GameCanvas from './components/GameCanvas';
import GameUI from './components/GameUI';
import ActionPanel from './components/ActionPanel';
import StatsPanel from './components/StatsPanel';
import '../../../src/games/football/football.css';

const FootballGame: React.FC = () => {
  const engineRef = useRef<FootballGameEngine | null>(null);
  const [stats, setStats] = useState<GameStats | null>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [gameRunning, setGameRunning] = useState(false);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Initialize game
  useEffect(() => {
    engineRef.current = new FootballGameEngine();
    setStats(engineRef.current.getStats());
  }, []);

  // Game loop
  useEffect(() => {
    if (!gameRunning || !engineRef.current) return;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      engineRef.current!.update(deltaTime);
      setStats({ ...engineRef.current!.getStats() });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [gameRunning]);

  const handleStartGame = () => {
    if (engineRef.current) {
      engineRef.current.startGame();
      setGameRunning(true);
    }
  };

  const handlePauseGame = () => {
    if (engineRef.current) {
      engineRef.current.pauseGame();
      setGameRunning(false);
    }
  };

  const handleResumeGame = () => {
    if (engineRef.current) {
      engineRef.current.resumeGame();
      setGameRunning(true);
    }
  };

  const handleSelectPlayer = (player: Player) => {
    setSelectedPlayer(player);
    if (engineRef.current) {
      engineRef.current.selectPlayer(player);
    }
  };

  const handleCanvasClick = (x: number, y: number) => {
    if (engineRef.current && selectedPlayer) {
      engineRef.current.setTargetPosition(x, y);
    }
  };

  const handleAction = (actionType: string) => {
    if (engineRef.current) {
      engineRef.current.performAction(actionType as any);
    }
  };

  if (!stats) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="football-game">
      <div className="game-container">
        <GameCanvas
          stats={stats}
          selectedPlayer={selectedPlayer}
          onCanvasClick={handleCanvasClick}
          onPlayerSelect={handleSelectPlayer}
        />
        <GameUI
          stats={stats}
          gameRunning={gameRunning}
          onStart={handleStartGame}
          onPause={handlePauseGame}
          onResume={handleResumeGame}
        />
      </div>
      <div className="game-panels">
        <ActionPanel
          selectedPlayer={selectedPlayer}
          onAction={handleAction}
          gameRunning={gameRunning}
        />
        <StatsPanel stats={stats} />
      </div>
    </div>
  );
};

export default FootballGame;

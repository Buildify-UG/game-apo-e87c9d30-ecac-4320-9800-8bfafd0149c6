import React, { useRef, useEffect } from 'react';
import { GameStats, Player } from '../types';
import { FIELD_WIDTH, FIELD_HEIGHT, GOAL_WIDTH, GOAL_HEIGHT } from '../utils';

interface GameCanvasProps {
  stats: GameStats;
  selectedPlayer: Player | null;
  onCanvasClick: (x: number, y: number) => void;
  onPlayerSelect: (player: Player) => void;
}

const GameCanvas: React.FC<GameCanvasProps> = ({
  stats,
  selectedPlayer,
  onCanvasClick,
  onPlayerSelect,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = '#2d5016';
    ctx.fillRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);

    // Draw field lines
    drawFieldLines(ctx);

    // Draw goals
    drawGoals(ctx);

    // Draw ball
    drawBall(ctx, stats.ball);

    // Draw players
    drawPlayers(ctx, stats, selectedPlayer);

    // Draw possession indicator
    drawPossessionIndicator(ctx, stats);
  }, [stats, selectedPlayer]);

  const drawFieldLines = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;

    // Center line
    ctx.beginPath();
    ctx.moveTo(FIELD_WIDTH / 2, 0);
    ctx.lineTo(FIELD_WIDTH / 2, FIELD_HEIGHT);
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(FIELD_WIDTH / 2, FIELD_HEIGHT / 2, 100, 0, Math.PI * 2);
    ctx.stroke();

    // Center spot
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(FIELD_WIDTH / 2 - 3, FIELD_HEIGHT / 2 - 3, 6, 6);

    // Penalty areas
    ctx.strokeRect(0, FIELD_HEIGHT / 2 - 150, 200, 300);
    ctx.strokeRect(FIELD_WIDTH - 200, FIELD_HEIGHT / 2 - 150, 200, 300);

    // Goal areas
    ctx.strokeRect(0, FIELD_HEIGHT / 2 - 100, 100, 200);
    ctx.strokeRect(FIELD_WIDTH - 100, FIELD_HEIGHT / 2 - 100, 100, 200);

    // Corner arcs
    const corners = [
      { x: 0, y: 0 },
      { x: FIELD_WIDTH, y: 0 },
      { x: 0, y: FIELD_HEIGHT },
      { x: FIELD_WIDTH, y: FIELD_HEIGHT },
    ];
    corners.forEach(corner => {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 50, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Boundary
    ctx.strokeRect(0, 0, FIELD_WIDTH, FIELD_HEIGHT);
  };

  const drawGoals = (ctx: CanvasRenderingContext2D) => {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';

    // Home goal
    ctx.fillRect(
      -50,
      FIELD_HEIGHT / 2 - GOAL_HEIGHT / 2,
      50,
      GOAL_HEIGHT
    );

    // Away goal
    ctx.fillRect(
      FIELD_WIDTH,
      FIELD_HEIGHT / 2 - GOAL_HEIGHT / 2,
      50,
      GOAL_HEIGHT
    );
  };

  const drawBall = (ctx: CanvasRenderingContext2D, ball: any) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, 8 + ball.z / 30, 0, Math.PI * 2);
    ctx.fill();

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y + 5, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawPlayers = (ctx: CanvasRenderingContext2D, stats: GameStats, selected: Player | null) => {
    const allPlayers = [...stats.homeTeam.players, ...stats.awayTeam.players];

    allPlayers.forEach(player => {
      const isSelected = selected?.id === player.id;
      const isHome = player.team === 'home';

      // Player circle
      ctx.fillStyle = isHome ? '#1e40af' : '#dc2626';
      ctx.beginPath();
      ctx.arc(player.x, player.y, 15, 0, Math.PI * 2);
      ctx.fill();

      // Selection highlight
      if (isSelected) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 20, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Ball indicator
      if (player.hasBall) {
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Player number
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(player.number.toString(), player.x, player.y);

      // Stamina bar
      const barWidth = 25;
      const barHeight = 3;
      ctx.fillStyle = '#333333';
      ctx.fillRect(player.x - barWidth / 2, player.y + 20, barWidth, barHeight);
      ctx.fillStyle = player.stamina > 30 ? '#22c55e' : '#ef4444';
      ctx.fillRect(player.x - barWidth / 2, player.y + 20, (barWidth * player.stamina) / 100, barHeight);
    });
  };

  const drawPossessionIndicator = (ctx: CanvasRenderingContext2D, stats: GameStats) => {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 200, 40);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.fillText('Possession:', 20, 30);

    ctx.fillStyle = stats.possession === 'home' ? '#1e40af' : '#dc2626';
    ctx.fillRect(130, 15, 10, 10);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText(stats.possession.toUpperCase(), 145, 24);
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on a player
    const allPlayers = [...stats.homeTeam.players, ...stats.awayTeam.players];
    for (const player of allPlayers) {
      const distance = Math.sqrt((player.x - x) ** 2 + (player.y - y) ** 2);
      if (distance < 20) {
        onPlayerSelect(player);
        return;
      }
    }

    // Otherwise, set target position
    onCanvasClick(x, y);
  };

  return (
    <canvas
      ref={canvasRef}
      width={FIELD_WIDTH}
      height={FIELD_HEIGHT}
      onClick={handleCanvasClick}
      className="game-canvas"
      style={{ cursor: 'pointer', border: '2px solid #333' }}
    />
  );
};

export default GameCanvas;

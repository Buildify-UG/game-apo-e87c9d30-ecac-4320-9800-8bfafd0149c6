import { Player, Ball, Team, TeamSide, Position } from './types';

export const FIELD_WIDTH = 1200;
export const FIELD_HEIGHT = 800;
export const GOAL_WIDTH = 150;
export const GOAL_HEIGHT = 300;

export const createPlayer = (
  id: string,
  name: string,
  number: number,
  position: Position,
  team: TeamSide,
  x: number,
  y: number
): Player => ({
  id,
  name,
  number,
  position,
  team,
  x,
  y,
  stamina: 100,
  speed: 70 + Math.random() * 30,
  skill: 60 + Math.random() * 40,
  hasBall: false,
});

export const createTeam = (name: string, side: TeamSide): Team => {
  const players: Player[] = [];
  const baseX = side === 'home' ? 150 : FIELD_WIDTH - 150;
  const positions: Array<{ pos: Position; count: number; spacing: number }> = [
    { pos: 'GK', count: 1, spacing: 0 },
    { pos: 'DEF', count: 4, spacing: 150 },
    { pos: 'MID', count: 4, spacing: 150 },
    { pos: 'FWD', count: 2, spacing: 200 },
  ];

  let playerNumber = 1;
  let yOffset = 0;

  positions.forEach(({ pos, count, spacing }) => {
    for (let i = 0; i < count; i++) {
      const y = FIELD_HEIGHT / 2 - (count - 1) * (spacing / 2) + i * spacing;
      players.push(
        createPlayer(
          `${side}-${playerNumber}`,
          `Player ${playerNumber}`,
          playerNumber,
          pos,
          side,
          baseX + yOffset,
          y
        )
      );
      playerNumber++;
    }
    yOffset += 200;
  });

  return {
    id: side,
    name,
    side,
    players,
    score: 0,
    possession: 0,
    shots: 0,
    shotsOnTarget: 0,
    passes: 0,
    tackles: 0,
    fouls: 0,
  };
};

export const createBall = (): Ball => ({
  x: FIELD_WIDTH / 2,
  y: FIELD_HEIGHT / 2,
  vx: 0,
  vy: 0,
  z: 0,
  possessedBy: null,
});

export const distance = (x1: number, y1: number, x2: number, y2: number): number => {
  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
};

export const isInGoal = (ballX: number, ballY: number, team: TeamSide): boolean => {
  if (team === 'home') {
    return ballX > FIELD_WIDTH - 20 && ballY > FIELD_HEIGHT / 2 - GOAL_HEIGHT / 2 && ballY < FIELD_HEIGHT / 2 + GOAL_HEIGHT / 2;
  } else {
    return ballX < 20 && ballY > FIELD_HEIGHT / 2 - GOAL_HEIGHT / 2 && ballY < FIELD_HEIGHT / 2 + GOAL_HEIGHT / 2;
  }
};

export const isOffside = (player: Player, ball: Ball, defendingTeam: Team): boolean => {
  const playerTeamPlayers = defendingTeam.players.filter(p => p.team === defendingTeam.side);
  const playerX = player.x;
  const defenseLineX = Math.min(...playerTeamPlayers.map(p => p.x));
  
  if (player.team === 'away' && playerX < defenseLineX && playerX < ball.x) {
    return true;
  }
  if (player.team === 'home' && playerX > defenseLineX && playerX > ball.x) {
    return true;
  }
  return false;
};

export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

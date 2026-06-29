export type Position = 'GK' | 'DEF' | 'MID' | 'FWD';
export type TeamSide = 'home' | 'away';
export type GameState = 'idle' | 'playing' | 'paused' | 'finished';
export type ActionType = 'pass' | 'shoot' | 'tackle' | 'dribble' | 'header' | 'throw-in' | 'corner' | 'free-kick' | 'penalty' | 'foul' | 'offside' | 'save' | 'goal';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  team: TeamSide;
  x: number;
  y: number;
  stamina: number;
  speed: number;
  skill: number;
  hasBall: boolean;
}

export interface Team {
  id: string;
  name: string;
  side: TeamSide;
  players: Player[];
  score: number;
  possession: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  tackles: number;
  fouls: number;
}

export interface Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  z: number; // height
  possessedBy: string | null;
}

export interface GameAction {
  type: ActionType;
  player: Player;
  team: Team;
  timestamp: number;
  success: boolean;
  details?: string;
}

export interface GameStats {
  homeTeam: Team;
  awayTeam: Team;
  ball: Ball;
  currentTime: number;
  gameState: GameState;
  actions: GameAction[];
  possession: TeamSide;
  lastAction: GameAction | null;
}

export interface MatchEvent {
  time: number;
  type: ActionType;
  player: Player;
  team: TeamSide;
  description: string;
  icon: string;
}

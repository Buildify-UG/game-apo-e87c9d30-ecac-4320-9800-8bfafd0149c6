import { GameStats, GameState, Player, Ball, GameAction, ActionType, TeamSide } from './types';
import {
  createTeam,
  createBall,
  distance,
  isInGoal,
  isOffside,
  clamp,
  FIELD_WIDTH,
  FIELD_HEIGHT,
} from './utils';

export class FootballGameEngine {
  private stats: GameStats;
  private gameState: GameState = 'idle';
  private selectedPlayer: Player | null = null;
  private targetPosition: { x: number; y: number } | null = null;

  constructor() {
    const homeTeam = createTeam('Home Team', 'home');
    const awayTeam = createTeam('Away Team', 'away');
    
    // Give ball to home team striker
    const homeStriker = homeTeam.players.find(p => p.position === 'FWD');
    if (homeStriker) {
      homeStriker.hasBall = true;
    }

    this.stats = {
      homeTeam,
      awayTeam,
      ball: createBall(),
      currentTime: 0,
      gameState: 'idle',
      actions: [],
      possession: 'home',
      lastAction: null,
    };
  }

  getStats(): GameStats {
    return this.stats;
  }

  startGame(): void {
    this.gameState = 'playing';
    this.stats.gameState = 'playing';
  }

  pauseGame(): void {
    this.gameState = 'paused';
    this.stats.gameState = 'paused';
  }

  resumeGame(): void {
    this.gameState = 'playing';
    this.stats.gameState = 'playing';
  }

  selectPlayer(player: Player): void {
    if (player.team === this.stats.possession) {
      this.selectedPlayer = player;
    }
  }

  setTargetPosition(x: number, y: number): void {
    this.targetPosition = { x: clamp(x, 0, FIELD_WIDTH), y: clamp(y, 0, FIELD_HEIGHT) };
  }

  performAction(actionType: ActionType): void {
    if (!this.selectedPlayer) return;

    const success = Math.random() > 0.3; // 70% success rate base
    const action: GameAction = {
      type: actionType,
      player: this.selectedPlayer,
      team: this.selectedPlayer.team === 'home' ? this.stats.homeTeam : this.stats.awayTeam,
      timestamp: this.stats.currentTime,
      success,
      details: `${this.selectedPlayer.name} - ${actionType}`,
    };

    this.stats.actions.push(action);
    this.stats.lastAction = action;

    switch (actionType) {
      case 'pass':
        this.handlePass(success);
        break;
      case 'shoot':
        this.handleShoot(success);
        break;
      case 'dribble':
        this.handleDribble(success);
        break;
      case 'tackle':
        this.handleTackle(success);
        break;
      case 'header':
        this.handleHeader(success);
        break;
    }
  }

  private handlePass(success: boolean): void {
    if (!this.selectedPlayer || !this.targetPosition) return;

    const team = this.selectedPlayer.team === 'home' ? this.stats.homeTeam : this.stats.awayTeam;
    this.stats.homeTeam.passes += this.selectedPlayer.team === 'home' ? 1 : 0;
    this.stats.awayTeam.passes += this.selectedPlayer.team === 'away' ? 1 : 0;

    if (success) {
      const nearbyPlayers = team.players.filter(
        p => p.id !== this.selectedPlayer!.id && distance(p.x, p.y, this.targetPosition!.x, this.targetPosition!.y) < 150
      );

      if (nearbyPlayers.length > 0) {
        this.selectedPlayer.hasBall = false;
        const receiver = nearbyPlayers[0];
        receiver.hasBall = true;
        this.selectedPlayer = receiver;
        this.stats.ball.x = receiver.x;
        this.stats.ball.y = receiver.y;
        this.stats.ball.possessedBy = receiver.id;
      }
    } else {
      // Turnover
      this.stats.possession = this.stats.possession === 'home' ? 'away' : 'home';
      this.selectedPlayer.hasBall = false;
    }
  }

  private handleShoot(success: boolean): void {
    if (!this.selectedPlayer) return;

    const team = this.selectedPlayer.team === 'home' ? this.stats.homeTeam : this.stats.awayTeam;
    team.shots += 1;

    const shootSkill = this.selectedPlayer.skill / 100;
    const shotSuccess = Math.random() < shootSkill * 0.6;

    if (shotSuccess) {
      team.shotsOnTarget += 1;
      const defendingTeam = this.selectedPlayer.team === 'home' ? this.stats.awayTeam : this.stats.homeTeam;
      const goalkeeper = defendingTeam.players.find(p => p.position === 'GK');

      if (goalkeeper && Math.random() < 0.4) {
        // Goal!
        team.score += 1;
        this.resetBall();
      } else {
        this.stats.possession = this.selectedPlayer.team === 'home' ? 'away' : 'home';
        this.selectedPlayer.hasBall = false;
      }
    } else {
      this.stats.possession = this.selectedPlayer.team === 'home' ? 'away' : 'home';
      this.selectedPlayer.hasBall = false;
    }
  }

  private handleDribble(success: boolean): void {
    if (!this.selectedPlayer || !this.targetPosition) return;

    if (success) {
      const dx = this.targetPosition.x - this.selectedPlayer.x;
      const dy = this.targetPosition.y - this.selectedPlayer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const moveDistance = Math.min(dist, 100);

      this.selectedPlayer.x += (dx / dist) * moveDistance;
      this.selectedPlayer.y += (dy / dist) * moveDistance;
      this.stats.ball.x = this.selectedPlayer.x;
      this.stats.ball.y = this.selectedPlayer.y;
      this.selectedPlayer.stamina = Math.max(0, this.selectedPlayer.stamina - 5);
    }
  }

  private handleTackle(success: boolean): void {
    if (!this.selectedPlayer) return;

    const opposingTeam = this.selectedPlayer.team === 'home' ? this.stats.awayTeam : this.stats.homeTeam;
    const playerWithBall = opposingTeam.players.find(p => p.hasBall);

    if (playerWithBall && success) {
      playerWithBall.hasBall = false;
      this.selectedPlayer.hasBall = true;
      this.stats.ball.possessedBy = this.selectedPlayer.id;
      this.stats.possession = this.selectedPlayer.team;
      
      const team = this.selectedPlayer.team === 'home' ? this.stats.homeTeam : this.stats.awayTeam;
      team.tackles += 1;
    }
  }

  private handleHeader(success: boolean): void {
    if (!this.selectedPlayer) return;

    const skillFactor = this.selectedPlayer.skill / 100;
    if (success && Math.random() < skillFactor) {
      this.stats.ball.z = 150;
      this.stats.ball.vx = (Math.random() - 0.5) * 300;
      this.stats.ball.vy = (Math.random() - 0.5) * 300;
    }
  }

  private resetBall(): void {
    this.stats.ball = createBall();
    this.stats.possession = 'home';
    const homeStriker = this.stats.homeTeam.players.find(p => p.position === 'FWD');
    if (homeStriker) {
      homeStriker.hasBall = true;
    }
    this.selectedPlayer = null;
  }

  update(deltaTime: number): void {
    if (this.gameState !== 'playing') return;

    this.stats.currentTime += deltaTime;

    // Update ball physics
    this.updateBallPhysics(deltaTime);

    // Update player positions (AI)
    this.updatePlayerPositions(deltaTime);

    // Check for goals
    if (isInGoal(this.stats.ball.x, this.stats.ball.y, 'home')) {
      this.stats.awayTeam.score += 1;
      this.resetBall();
    } else if (isInGoal(this.stats.ball.x, this.stats.ball.y, 'away')) {
      this.stats.homeTeam.score += 1;
      this.resetBall();
    }

    // Check for end of match (90 minutes)
    if (this.stats.currentTime > 5400) {
      this.gameState = 'finished';
      this.stats.gameState = 'finished';
    }
  }

  private updateBallPhysics(deltaTime: number): void {
    const ball = this.stats.ball;

    if (ball.possessedBy === null) {
      // Apply gravity
      ball.z = Math.max(0, ball.z - 9.8 * deltaTime);

      // Apply air resistance
      ball.vx *= 0.99;
      ball.vy *= 0.99;

      // Update position
      ball.x = clamp(ball.x + ball.vx * deltaTime, 0, FIELD_WIDTH);
      ball.y = clamp(ball.y + ball.vy * deltaTime, 0, FIELD_HEIGHT);

      // Bounce off walls
      if (ball.x <= 0 || ball.x >= FIELD_WIDTH) ball.vx *= -0.8;
      if (ball.y <= 0 || ball.y >= FIELD_HEIGHT) ball.vy *= -0.8;
    }
  }

  private updatePlayerPositions(deltaTime: number): void {
    // Simple AI: move towards ball if on possession team
    const possessionTeam = this.stats.possession === 'home' ? this.stats.homeTeam : this.stats.awayTeam;

    possessionTeam.players.forEach(player => {
      if (!player.hasBall) {
        const dx = this.stats.ball.x - player.x;
        const dy = this.stats.ball.y - player.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 50) {
          const moveSpeed = (player.speed / 100) * 200;
          player.x += (dx / distance) * moveSpeed * deltaTime;
          player.y += (dy / distance) * moveSpeed * deltaTime;
        }
      }
    });

    // Restore stamina when not moving much
    possessionTeam.players.forEach(player => {
      player.stamina = Math.min(100, player.stamina + 0.5);
    });
  }
}

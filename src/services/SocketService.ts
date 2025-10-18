import { io, Socket } from 'socket.io-client';
import { GameState, MoveData, GameFinishedData } from '../types/game';

export class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl = (import.meta as any).env?.VITE_SERVER_URL || 'http://localhost:4000';
  }

  public connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(this.serverUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  // Connection lifecycle listeners
  public onConnect(callback: () => void): void {
    this.socket?.on('connect', callback);
  }

  public onDisconnect(callback: () => void): void {
    this.socket?.on('disconnect', callback);
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  public joinQueue(username: string): void {
    if (this.socket) {
      this.socket.emit('join_queue', { username });
    }
  }

  public leaveQueue(): void {
    if (this.socket) {
      this.socket.emit('leave_queue');
    }
  }

  public makeMove(gameId: string, position: number): void {
    if (this.socket) {
      this.socket.emit('make_move', { gameId, position });
    }
  }

  public getGameState(gameId: string): void {
    if (this.socket) {
      this.socket.emit('get_game_state', gameId);
    }
  }

  public reconnect(username: string, gameId?: string): void {
    if (this.socket) {
      this.socket.emit('reconnect', { username, gameId });
    }
  }

  // Event listeners
  public onQueueJoined(callback: (data: { message: string }) => void): void {
    this.socket?.on('queue_joined', callback);
  }

  public onQueueLeft(callback: (data: { message: string }) => void): void {
    this.socket?.on('queue_left', callback);
  }

  public onGameStarted(callback: (gameData: GameState) => void): void {
    this.socket?.on('game_started', callback);
  }

  public onMoveMade(callback: (moveData: MoveData) => void): void {
    this.socket?.on('move_made', callback);
  }

  public onGameFinished(callback: (gameData: GameFinishedData) => void): void {
    this.socket?.on('game_finished', callback);
  }

  public onOpponentDisconnected(callback: (data: { gameId: string; message: string }) => void): void {
    this.socket?.on('opponent_disconnected', callback);
  }

  public onMoveError(callback: (data: { message: string }) => void): void {
    this.socket?.on('move_error', callback);
  }

  public onGameState(callback: (gameData: GameState) => void): void {
    this.socket?.on('game_state', callback);
  }

  public onReconnected(callback: (data: { gameId: string; game: GameState }) => void): void {
    this.socket?.on('reconnected', callback);
  }

  public onQueueRejoined(callback: (data: { message: string }) => void): void {
    this.socket?.on('queue_rejoined', callback);
  }

  public onError(callback: (data: { message: string }) => void): void {
    this.socket?.on('error', callback);
  }

  public onShowWinEffect(callback: (data: { winner: 'X' | 'O'; winnerUsername: string }) => void): void {
    this.socket?.on('showWinEffect', callback);
  }

  // Remove event listeners
  public off(event: string, callback?: (...args: any[]) => void): void {
    this.socket?.off(event, callback);
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

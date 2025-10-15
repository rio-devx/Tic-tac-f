export interface Player {
  id: string;
  username: string;
  socketId: string;
  wins: number;
  losses: number;
  draws: number;
  symbol?: 'X' | 'O';
}

export interface GameState {
  gameId: string;
  players: Player[];
  board: string[];
  currentPlayer: 'X' | 'O' | null;
  status: 'waiting' | 'playing' | 'finished';
  winner: 'X' | 'O' | 'draw' | null;
}

export interface MoveData {
  gameId: string;
  position: number;
  board: string[];
  currentPlayer: 'X' | 'O' | null;
  winner: 'X' | 'O' | 'draw' | null;
  status: 'waiting' | 'playing' | 'finished';
}

export interface GameFinishedData {
  gameId: string;
  winner: 'X' | 'O' | 'draw' | null;
  board: string[];
}

export interface LeaderboardEntry {
  _id: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}


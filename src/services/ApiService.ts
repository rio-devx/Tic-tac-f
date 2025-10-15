export interface ApiLeaderboardEntry {
  _id: string;
  username: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}

export interface ApiPlayerStatsResponse {
  username: string;
  wins: number;
  losses: number;
  draws: number;
  totalGames: number;
  winRate: number;
}

export class ApiService {
  private static baseUrl = (import.meta as any).env?.VITE_SERVER_URL || '';
  private static apiPrefix = '/api/games';

  private static buildUrl(path: string): string {
    const base = this.baseUrl?.replace(/\/$/, '') || '';
    const p = path.startsWith('/') ? path : `/${path}`;
    return `${base}${this.apiPrefix}${p}`;
  }

  static async getLeaderboard(limit: number = 20): Promise<ApiLeaderboardEntry[]> {
    const res = await fetch(this.buildUrl(`/leaderboard?limit=${encodeURIComponent(limit)}`));
    if (!res.ok) throw new Error('Failed to fetch leaderboard');
    const data = await res.json();
    return data?.data ?? [];
  }

  static async getPlayerStats(username: string): Promise<ApiPlayerStatsResponse> {
    const res = await fetch(this.buildUrl(`/players/${encodeURIComponent(username)}/stats`));
    if (res.status === 404) throw new Error('Player not found');
    if (!res.ok) throw new Error('Failed to fetch player stats');
    const data = await res.json();
    return data?.data;
  }

  static async createOrUpdatePlayer(username: string): Promise<void> {
    const res = await fetch(this.buildUrl('/players'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username })
    });
    if (!res.ok) throw new Error('Failed to create/update player');
  }

  static async getGameHistory(username: string, page: number = 1, limit: number = 10): Promise<unknown> {
    const res = await fetch(this.buildUrl(`/players/${encodeURIComponent(username)}/history?page=${page}&limit=${limit}`));
    // Backend returns 501 (not implemented) currently; surface a friendly error
    if (res.status === 501) throw new Error('Game history not available yet');
    if (!res.ok) throw new Error('Failed to fetch game history');
    return res.json();
  }
}



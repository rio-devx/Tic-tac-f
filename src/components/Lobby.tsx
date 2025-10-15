import React, { useState } from 'react';
import { Users, Search, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface LobbyProps {
  onJoinGame: (username: string) => void;
  isConnected?: boolean;
}

export const Lobby: React.FC<LobbyProps> = ({ onJoinGame, isConnected = false }) => {
  const [username, setUsername] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [queueStatus, setQueueStatus] = useState<'idle' | 'waiting' | 'joined'>('idle');
  const [queueMessage, setQueueMessage] = useState('');
  const [stats, setStats] = useState<{
    username: string;
    wins: number;
    losses: number;
    draws: number;
    totalGames: number;
    winRate: number;
  } | null>(null);
  const [historyPreview, setHistoryPreview] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const handleJoinQueue = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }

    if (!isConnected) {
      alert('Connecting to server. Please wait a moment and try again.');
      return;
    }

    setIsJoining(true);
    setQueueStatus('waiting');
    setQueueMessage('Joining matchmaking queue...');
    
    try {
      onJoinGame(username.trim());
      // Don't set status to 'joined' immediately - wait for server response
      setQueueMessage('Waiting for server response...');
    } catch (error) {
      console.error('Failed to join queue:', error);
      setQueueStatus('idle');
      setQueueMessage('Failed to join queue. Please try again.');
      setIsJoining(false);
    }
  };

  const handleLeaveQueue = () => {
    setQueueStatus('idle');
    setQueueMessage('');
    setIsJoining(false);
    // Note: The actual leave queue logic is handled in the parent component
  };

  const handleViewStats = async () => {
    if (!username.trim()) {
      alert('Enter a username to view stats');
      return;
    }
    try {
      const { ApiService } = await import('@/services/ApiService');
      const data = await ApiService.getPlayerStats(username.trim());
      setStats(data);
    } catch (err) {
      setStats(null);
      alert(err instanceof Error ? err.message : 'Failed to fetch stats');
    }
  };

  const handleViewHistory = async () => {
    if (!username.trim()) {
      alert('Enter a username to view history');
      return;
    }
    try {
      setHistoryError(null);
      const { ApiService } = await import('@/services/ApiService');
      const data = await ApiService.getGameHistory(username.trim(), 1, 5);
      setHistoryPreview(typeof data === 'string' ? data : 'History fetched');
    } catch (err) {
      setHistoryPreview(null);
      setHistoryError(err instanceof Error ? err.message : 'Failed to fetch game history');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold mb-2">🎮 Game Lobby</h2>
        <p className="text-sm sm:text-base text-muted-foreground">
          Enter your username to start playing Tic-Tac-Toe with players around the world!
        </p>
      </div>

      {queueStatus === 'idle' && (
        <form onSubmit={handleJoinQueue} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-foreground mb-4 text-center">
              Username
            </label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              maxLength={20}
              disabled={isJoining || !isConnected}
            />
          </div>
          
          <Button
            type="submit"
            disabled={isJoining || !username.trim() || !isConnected}
            className="w-full motion-safe:transition-all"
          >
            {isJoining ? (
              <>
                <Loader className="loading motion-safe:animate-spin" />
                Joining Queue...
              </>
            ) : (
              <>
                <Search />
                {isConnected ? 'Find Match' : 'Connecting...'}
              </>
            )}
          </Button>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center text-sm text-muted-foreground">
            <span>Want to check your stats first?</span>
            <Button type="button" variant="secondary" onClick={handleViewStats} disabled={!username.trim()}>
              View Stats
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-0 justify-between items-center text-sm text-muted-foreground">
            <span>Curious about recent games?</span>
            <Button type="button" variant="secondary" onClick={handleViewHistory} disabled={!username.trim()}>
              View History
            </Button>
          </div>
        </form>
      )}

      {queueStatus === 'waiting' && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Loader className="loading motion-safe:animate-spin" />
          </div>
          <p className="text-base sm:text-lg font-semibold text-foreground">{queueMessage}</p>
          <Button onClick={handleLeaveQueue} variant="secondary">
            Cancel
          </Button>
        </div>
      )}

      {queueStatus === 'joined' && (
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center">
            <Users className="w-7 h-7 sm:w-8 sm:h-8 text-blue-400 motion-safe:animate-bounce" />
          </div>
          <div className="space-y-2">
            <p className="text-base sm:text-lg font-semibold text-blue-400">{queueMessage}</p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              We'll match you with another player soon!
            </p>
          </div>
          <Button onClick={handleLeaveQueue} variant="secondary">
            Leave Queue
          </Button>
        </div>
      )}

      <div className="bg-muted rounded-lg p-3 sm:p-4">
        {!isConnected && (
          <p className="text-sm text-yellow-500 mb-2">Connecting to server...</p>
        )}
        <h3 className="font-semibold mb-2">How to Play:</h3>
        <ul className="text-sm sm:text-base text-muted-foreground space-y-1">
          <li>• Click on any empty square to make your move</li>
          <li>• Get three in a row (horizontally, vertically, or diagonally) to win</li>
          <li>• If all squares are filled with no winner, it's a draw</li>
          <li>• Games are automatically saved to your statistics</li>
        </ul>
        {stats && (
          <div className="mt-4 text-sm">
            <h4 className="font-semibold mb-1 text-foreground">Player Stats for {stats.username}</h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-muted-foreground">
              <span>Wins:</span><span className="text-foreground font-semibold">{stats.wins}</span>
              <span>Losses:</span><span className="text-foreground font-semibold">{stats.losses}</span>
              <span>Draws:</span><span className="text-foreground font-semibold">{stats.draws}</span>
              <span>Total Games:</span><span className="text-foreground font-semibold">{stats.totalGames}</span>
              <span>Win Rate:</span><span className="text-foreground font-semibold">{Math.round(stats.winRate)}%</span>
            </div>
          </div>
        )}
        {(historyError || historyPreview) && (
          <div className="mt-4 text-sm">
            <h4 className="font-semibold mb-1 text-foreground">Game History</h4>
            {historyError ? (
              <p className="text-yellow-500">{historyError}</p>
            ) : (
              <p className="text-muted-foreground">Showing preview of recent games (will be enhanced when backend is ready).</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

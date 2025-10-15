import React, { useState, useEffect } from 'react';
import { ArrowLeft, Trophy, Medal, Award, Users, TrendingUp } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';
import { ApiService } from '@/services/ApiService';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

interface LeaderboardProps {
  onBack: () => void;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ onBack }) => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getLeaderboard(20);
      setLeaderboard(data as unknown as LeaderboardEntry[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch leaderboard');
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-400" />;
      default:
        return <span className="text-gray-400 font-semibold">#{index + 1}</span>;
    }
  };

  const getRankColor = (index: number) => {
    switch (index) {
      case 0:
        return 'bg-yellow-500/10 border-yellow-500/30';
      case 1:
        return 'bg-gray-500/10 border-gray-500/30';
      case 2:
        return 'bg-amber-500/10 border-amber-500/30';
      default:
        return 'bg-background border-border';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft />
            Back to Lobby
          </Button>
          <h2 className="text-2xl font-bold">🏆 Leaderboard</h2>
          <div></div>
        </div>
        
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="flex justify-between items-center">
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft />
            Back to Lobby
          </Button>
          <h2 className="text-2xl font-bold">🏆 Leaderboard</h2>
          <div></div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchLeaderboard}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center">
        <Button onClick={onBack} variant="secondary">
          <ArrowLeft />
          Back to Lobby
        </Button>
        <h2 className="text-2xl font-bold">🏆 Leaderboard</h2>
        <div></div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="text-center">
          <CardContent className="p-4">
            <Users className="w-8 h-8 mx-auto mb-2 text-blue-400" />
            <p className="text-2xl font-bold text-blue-400">{leaderboard.length}</p>
            <p className="text-sm text-gray-400">Players</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <Trophy className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-bold text-green-400">
              {leaderboard.reduce((sum, player) => sum + player.wins, 0)}
            </p>
            <p className="text-sm text-gray-400">Total Wins</p>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="text-2xl font-bold text-purple-400">
              {leaderboard.length > 0 
                ? Math.round(leaderboard.reduce((sum, player) => sum + player.winRate, 0) / leaderboard.length)
                : 0}%
            </p>
            <p className="text-sm text-gray-400">Avg Win Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-foreground">Top Players</CardTitle>
        </CardHeader>
        {leaderboard.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400">No players found. Be the first to play!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {leaderboard.map((player, index) => (
              <div
                key={player._id}
                className={`p-6 flex items-center justify-between ${getRankColor(index)}`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8">
                    {getRankIcon(index)}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-foreground">
                      {player.username}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {player.totalGames} games played
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex gap-6 text-sm">
                    <div>
                      <p className="text-green-400 font-semibold">{player.wins}</p>
                      <p className="text-muted-foreground">Wins</p>
                    </div>
                    <div>
                      <p className="text-red-400 font-semibold">{player.losses}</p>
                      <p className="text-muted-foreground">Losses</p>
                    </div>
                    <div>
                      <p className="text-foreground font-semibold">{player.draws}</p>
                      <p className="text-muted-foreground">Draws</p>
                    </div>
                    <div>
                      <p className="text-blue-400 font-semibold">
                        {Math.round(player.winRate)}%
                      </p>
                      <p className="text-muted-foreground">Win Rate</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="text-center text-sm text-muted-foreground">
        <p>Leaderboard updates in real-time. Play games to improve your ranking!</p>
      </div>
    </div>
  );
};



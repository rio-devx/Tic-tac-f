import React, { useState } from 'react';
import { GameState, Player } from '../types/game';
import { ArrowLeft, RotateCcw, Trophy } from 'lucide-react';
import { MoveNotification } from './MoveNotification';
import { Button } from '@/components/ui/button';

interface GameBoardProps {
  gameState: GameState;
  player: Player;
  onMakeMove: (position: number) => void;
  onLeaveGame: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  player,
  onMakeMove,
  onLeaveGame
}) => {
  const [lastMove, setLastMove] = useState<{ position: number; symbol: 'X' | 'O'; playerName: string } | null>(null);
  const getPlayerSymbol = (playerId: string): 'X' | 'O' => {
    return gameState.players[0].id === playerId ? 'X' : 'O';
  };

  const getCurrentPlayerInfo = () => {
    const currentPlayer = gameState.players.find(p => 
      getPlayerSymbol(p.id) === gameState.currentPlayer
    );
    return currentPlayer;
  };

  const getPlayerSymbolForCurrentUser = (): 'X' | 'O' | null => {
    if (!player?.username) {
      console.log('No player username available');
      return null;
    }
    
    const currentPlayer = gameState.players.find(p => p.username === player.username);
    if (!currentPlayer) {
      console.log(`Player ${player.username} not found in game players:`, gameState.players.map(p => p.username));
      return null;
    }
    
    // Use explicit symbol from player object
    const symbol = currentPlayer.symbol;
    console.log(`Player ${player.username} (${currentPlayer.id}) has symbol: ${symbol}`);
    return symbol || null;
  };

  const isMyTurn = (): boolean => {
    const mySymbol = getPlayerSymbolForCurrentUser();
    const isMyTurnResult = gameState.currentPlayer === mySymbol;
    
    console.log(`Turn check: currentPlayer=${gameState.currentPlayer}, mySymbol=${mySymbol}, isMyTurn=${isMyTurnResult}`);
    
    return isMyTurnResult;
  };

  const canMakeMove = (position: number): boolean => {
    return gameState.board[position] === '' && isMyTurn() && gameState.status === 'playing';
  };

  const handleCellClick = (position: number) => {
    if (canMakeMove(position)) {
      // Show immediate feedback for your move
      const mySymbol = getPlayerSymbolForCurrentUser();
      if (mySymbol) {
        setLastMove({ position, symbol: mySymbol, playerName: player.username });
      }
      onMakeMove(position);
    }
  };

  const getWinnerMessage = (): string => {
    if (!gameState.winner) return '';
    
    if (gameState.winner === 'draw') {
      return "It's a draw!";
    }
    
    const winningPlayer = gameState.players.find(p => 
      getPlayerSymbol(p.id) === gameState.winner
    );
    
    if (winningPlayer) {
      return `${winningPlayer.username} wins!`;
    }
    
    return '';
  };

  const renderCell = (index: number) => {
    const value = gameState.board[index];
    const canClick = canMakeMove(index);
    const isRecentMove = gameState.board[index] !== ''; // Could add animation logic here
    
    return (
      <button
        key={index}
        onClick={() => handleCellClick(index)}
        disabled={!canClick}
        className={`
          w-14 h-14 sm:w-20 sm:h-20 md:w-24 md:h-24 text-xl sm:text-2xl md:text-3xl font-bold rounded-lg border-2 transition-all duration-300 transform
          ${value === 'X' 
            ? 'bg-blue-500/20 text-blue-400 border-blue-400/50 scale-105 shadow-lg motion-safe:animate-bounce-in' 
            : value === 'O' 
            ? 'bg-red-500/20 text-red-400 border-red-400/50 scale-105 shadow-lg motion-safe:animate-bounce-in'
            : canClick
            ? 'bg-muted/50 hover:bg-muted border-border hover:border-primary/50 cursor-pointer hover:scale-105 hover:shadow-md motion-safe:animate-scale-in'
            : 'bg-muted/30 border-border cursor-not-allowed opacity-50'
          }
          ${isRecentMove ? 'motion-safe:animate-pulse-glow' : ''}
        `}
        title={value ? `${value} at position ${index}` : canClick ? `Click to place your move` : `Position ${index}`}
      >
        {value || (canClick ? '•' : '')}
      </button>
    );
  };

  const currentPlayerInfo = getCurrentPlayerInfo();
  const mySymbol = getPlayerSymbolForCurrentUser();

  // Debug logging
  console.log('GameBoard Debug:', {
    gameState,
    player,
    mySymbol,
    isMyTurn: isMyTurn(),
    currentPlayer: gameState.currentPlayer,
    status: gameState.status
  });

  // Show loading state if player data isn't ready
  if (!player?.username || !mySymbol) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          <p className="mt-4 text-muted-foreground">Loading game data...</p>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>Player: {player?.username || 'Not set'}</p>
            <p>My Symbol: {mySymbol || 'Not determined'}</p>
            <p>Game Players: {gameState.players.map(p => `${p.username}(${p.symbol || 'no-symbol'})`).join(', ')}</p>
            <p>Current Player: {gameState.currentPlayer}</p>
          </div>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Reload Game
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Move Notification */}
      <MoveNotification moveData={lastMove || undefined} />
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-0 justify-between items-center">
        <Button
          onClick={() => {
            const confirmLeave = window.confirm('Leave the current game and return to the lobby?');
            if (confirmLeave) onLeaveGame();
          }}
          variant="secondary"
          className="backdrop-blur"
        >
          <ArrowLeft />
          Leave Game
        </Button>
        
        <div className="text-center">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold">Game #{gameState.gameId.slice(-6)}</h2>
          {gameState.status === 'playing' && currentPlayerInfo && (
            <p className="text-sm text-gray-600">
              {isMyTurn() ? 'Your turn' : `${currentPlayerInfo.username}'s turn`}
            </p>
          )}
        </div>
        
        <div className="w-24 hidden sm:block"></div> {/* Spacer for centering on larger screens */}
      </div>

      {/* Players Info */}
      <div className="flex flex-row sm:flex-row justify-around items-stretch sm:items-center bg-muted/30 border border-border/50 rounded-xl p-3 sm:p-4 gap-3 sm:gap-6 shadow-sm motion-safe:animate-slide-up">
        {gameState.players.map((gamePlayer) => {
          const symbol = getPlayerSymbol(gamePlayer.id);
          const isMe = gamePlayer.username === player.username;
          
          return (
            <div key={gamePlayer.id} className="text-center motion-safe:animate-fade-in">
              <div className={`
                w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold mb-2 transition-all duration-300
                ${symbol === 'X' ? 'bg-blue-500/20 text-blue-300 border border-blue-400/30' : 'bg-red-500/20 text-red-300 border border-red-400/30'}
                ${isMe ? 'ring-2 ring-primary shadow-md motion-safe:animate-pulse-glow' : ''}
              `}>
                {symbol}
              </div>
              <p className="font-semibold text-foreground">{gamePlayer.username}</p>
              {isMe && <p className="text-xs text-primary">(You)</p>}
            </div>
          );
        })}
      </div>

      {/* Game Board */}
      <div className="flex justify-center motion-safe:animate-scale-in">
        <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4 bg-muted/20 p-3 sm:p-4 md:p-6 rounded-2xl backdrop-blur-sm border border-border/50 shadow-sm">
          {Array.from({ length: 9 }, (_, index) => renderCell(index))}
        </div>
      </div>

      {/* Game Status */}
      {gameState.status === 'finished' && (
        <div className="text-center space-y-4 motion-safe:animate-bounce-in">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 md:p-6 backdrop-blur-sm">
            <Trophy className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2 text-yellow-400 motion-safe:animate-pulse" />
            <h3 className="text-base sm:text-lg font-bold text-yellow-300">
              {getWinnerMessage()}
            </h3>
            {gameState.winner !== 'draw' && mySymbol === gameState.winner && (
              <p className="text-sm text-yellow-300 mt-1 motion-safe:animate-pulse-glow">
                🎉 Congratulations! You won!
              </p>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center motion-safe:animate-slide-up">
            <Button onClick={onLeaveGame}>
              <RotateCcw />
              Play Again
            </Button>
            <Button onClick={onLeaveGame} variant="secondary" className='w-full bg-amber-200'>
              Back to Lobby
            </Button>
          </div>
        </div>
      )}

      {/* Game Info */}
      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 motion-safe:animate-slide-up">
        <h3 className="font-semibold mb-2 text-foreground">Game Rules:</h3>
        <ul className="text-sm md:text-base text-muted-foreground space-y-1">
          <li>• You are playing as <strong className="text-primary">{mySymbol}</strong></li>
          <li>• Make three in a row to win</li>
          <li>• {isMyTurn() ? 'It\'s your turn!' : 'Wait for your opponent\'s move'}</li>
          <li>• Games are automatically saved</li>
        </ul>
      </div>
    </div>
  );
};

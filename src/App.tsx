import { useState, useEffect, useRef } from 'react';
import { SocketService } from './services/SocketService';
import { Lobby } from './components/Lobby';
import { GameBoard } from './components/GameBoard';
import { Leaderboard } from './components/Leaderboard';
import { GameState, Player } from './types/game';

function App() {
  const [currentView, setCurrentView] = useState<'lobby' | 'game' | 'leaderboard'>('lobby');
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  // Note: username state removed to avoid stale closures; using ref instead
  const usernameRef = useRef<string>('');
  const [socketService] = useState(() => new SocketService());

  useEffect(() => {
    // Initialize socket connection
    socketService.connect();
    setIsConnected(socketService.isConnected());

    // On fresh load, ensure no stale player data exists
    setPlayer(null);
    usernameRef.current = '';

    // Ensure backend queue/session is cleared on page reload/close
    const handleBeforeUnload = () => {
      try {
        socketService.leaveQueue();
      } catch {}
      socketService.disconnect();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Track connection status
    socketService.onConnect(() => setIsConnected(true));
    socketService.onDisconnect(() => setIsConnected(false));

    // Listen for queue events
    socketService.onQueueJoined((_data) => {
      // The game will start automatically when matched
    });

    socketService.onQueueLeft((_data) => {
      // no-op
    });

    // Listen for game events
    socketService.onGameStarted((gameData) => {
      
      setGameState(gameData);
      
      // Update player object with the actual player data from the game
      const wanted = (usernameRef.current || '').trim().toLowerCase();
      const currentPlayer = gameData.players.find(p => (p.username || '').trim().toLowerCase() === wanted);
      
      if (currentPlayer) {
        setPlayer(currentPlayer);
      } else {
        console.error('Player not found in game data!');
        console.error('Expected username:', usernameRef.current);
        console.error('Available players:', gameData.players);
        alert(`Error: Player ${usernameRef.current} not found in game. Please rejoin.`);
        setCurrentView('lobby');
        return;
      }
      
      setCurrentView('game');
    });

    socketService.onMoveMade((moveData) => {
      
      setGameState(prev => prev ? {
        ...prev,
        board: moveData.board,
        currentPlayer: moveData.currentPlayer,
        winner: moveData.winner,
        status: moveData.status
      } : null);
      
      // Show a brief notification
    });

    socketService.onGameFinished((gameData) => {
      setGameState(prev => prev ? {
        ...prev,
        winner: gameData.winner,
        board: gameData.board,
        status: 'finished'
      } : null);
    });

    socketService.onOpponentDisconnected(() => {
      alert('Your opponent disconnected. Returning to lobby.');
      setCurrentView('lobby');
      setGameState(null);
    });

    socketService.onError((error) => {
      console.error('Socket error:', error);
      alert(`Error: ${error.message}`);
    });

    socketService.onMoveError((error) => {
      console.error('Move error:', error);
      alert(`Move Error: ${error.message}`);
    });

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      socketService.disconnect();
    };
  }, [socketService]);

  const handleJoinGame = (username: string) => {
    const cleaned = username.trim();
    usernameRef.current = cleaned;
    // Ensure player exists in backend DB
    // (best-effort; gameplay continues even if this fails)
    (async () => {
      try {
        const { ApiService } = await import('./services/ApiService');
        await ApiService.createOrUpdatePlayer(cleaned);
      } catch {}
    })();
    const newPlayer: Player = {
      id: '',
      username: cleaned,
      socketId: '',
      wins: 0,
      losses: 0,
      draws: 0
    };
    setPlayer(newPlayer);
    socketService.joinQueue(cleaned);
  };

  const handleLeaveGame = () => {
    socketService.leaveQueue();
    setCurrentView('lobby');
    setGameState(null);
  };

  const handleMakeMove = (position: number) => {
    if (!gameState) {
      console.error('❌ No game state available');
      alert('No game state available. Please rejoin the game.');
      return;
    }

    if (!player) {
      console.error('❌ No player data available');
      alert('No player data available. Please rejoin the game.');
      return;
    }

    
    // Use explicit symbol from player object
    const mySymbol = player.symbol;
    
    if (!mySymbol) {
      console.error(`❌ No symbol assigned to player!`);
      console.error('Player object:', player);
      console.error('Game state players:', gameState.players);
      alert(`Error: No symbol assigned to player ${player.username}. Please rejoin the game.`);
      return;
    }
    
    if (gameState.currentPlayer !== mySymbol) {
      console.error(`❌ Not my turn! Current: ${gameState.currentPlayer}, My symbol: ${mySymbol}`);
      alert(`Not your turn! Current player is ${gameState.currentPlayer}. You are ${mySymbol}.`);
      return;
    }
    
    if (gameState.board[position] !== '') {
      console.error(`❌ Position ${position} already occupied`);
      alert('This position is already taken!');
      return;
    }
    
    socketService.makeMove(gameState.gameId, position);
    
    // Optimistic update - show the move immediately
    setGameState(prev => prev ? {
      ...prev,
      board: prev.board.map((cell, index) => 
        index === position ? mySymbol : cell
      )
    } : null);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'lobby':
        return <Lobby onJoinGame={handleJoinGame} isConnected={isConnected} />;
      case 'game':
        return gameState && player ? (
          <GameBoard
            gameState={gameState}
            player={player}
            onMakeMove={handleMakeMove}
            onLeaveGame={handleLeaveGame}
          />
        ) : null;
      case 'leaderboard':
        return <Leaderboard onBack={() => setCurrentView('lobby')} />;
      // case 'debug':
      //   return <GameDebug />;
      default:
        return <Lobby onJoinGame={handleJoinGame} isConnected={isConnected} />;
    }
  };

  return (
    <div className="min-h-screen flex items-center overflow-hidden justify-center p-4">
      <div className="w-full max-w-4xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            🎮 Multiplayer Tic-Tac-Toe
          </h1>
          <nav className="flex justify-center gap-4 items-center">
            <button
              onClick={() => setCurrentView('lobby')}
              className={`btn ${currentView === 'lobby' ? '' : 'btn-secondary'}`}
            >
              Lobby
            </button>
            <button
              onClick={() => setCurrentView('leaderboard')}
              className={`btn ${currentView === 'leaderboard' ? '' : 'btn-secondary'}`}
            >
              Leaderboard
            </button>
            {/* <button
              onClick={() => setCurrentView('debug')}
              className={`btn ${currentView === 'debug' ? '' : 'btn-secondary'}`}
            >
              Debug
            </button> */}
            <span
              className={`inline-flex w-20 h-12 items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border backdrop-blur ${
                isConnected
                  ? 'bg-green-500/10 text-green-400 border-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.15)]'
                  : 'bg-red-500/10 text-red-400 border-red-500/30'
              }`}
              aria-live="polite"
            >
              <span
                className={`rounded-full bg-current ${isConnected ? 'motion-safe:animate-pulse' : ''}`}
                aria-hidden="true"
              />
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </nav>
        </header>
        
        <main className="card">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}

export default App;

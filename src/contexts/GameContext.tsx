import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { v4 as uuidv4 } from "uuid";
import { Game, GameStatus, Player, LeaderboardEntry } from "../types/game";
import { useToast } from "@/components/ui/use-toast";

interface GameContextProps {
  game: Game | null;
  currentPlayer: Player | null;
  leaderboard: LeaderboardEntry[];
  username: string;
  setUsername: (username: string) => void;
  createGame: (startPage: string, endPage: string, timeLimit: number) => void;
  joinGame: (gameId: string) => boolean;
  startGame: () => void;
  handleLinkClick: (url: string) => void;
  checkGameCompletion: (currentPage: string) => boolean;
  kickPlayer: (playerId: string) => void;
  resignGame: () => void;
  resetGame: () => void;
  timeRemaining: number | null;
}

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [username, setUsername] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [game, setGame] = useState<Game | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const { toast } = useToast();

  // Initialize user ID on component mount
  useEffect(() => {
    const storedUserId = localStorage.getItem("hyperlink-hustle-user-id");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = uuidv4();
      localStorage.setItem("hyperlink-hustle-user-id", newUserId);
      setUserId(newUserId);
    }
  }, []);

  // Timer effect for active games
  useEffect(() => {
    if (!game || game.status !== GameStatus.ACTIVE || !game.endAt) {
      return;
    }

    const intervalId = setInterval(() => {
      const remaining = Math.max(0, game.endAt! - Date.now());
      setTimeRemaining(remaining);
      
      // Check for game end by timeout
      if (remaining <= 0) {
        endGame();
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [game]);

  const createGame = (startPage: string, endPage: string, timeLimit: number) => {
    if (!username || !userId) {
      toast({
        title: "Error",
        description: "Please set your username first",
        variant: "destructive",
      });
      return;
    }

    const gameId = Math.random().toString(36).substring(2, 8).toUpperCase();
    
    const newGame: Game = {
      id: gameId,
      hostId: userId,
      startPage,
      endPage,
      timeLimit,
      status: GameStatus.PENDING,
      players: {
        [userId]: {
          id: userId,
          username,
          clicks: 0,
          currentPage: startPage,
          finished: false,
          resigned: false,
        },
      },
    };

    setGame(newGame);
    setCurrentPlayer(newGame.players[userId]);
    
    toast({
      title: "Game created!",
      description: `Share the code: ${gameId} with your friends`,
    });
    
    return gameId;
  };

  const joinGame = (gameId: string): boolean => {
    if (!username || !userId) {
      toast({
        title: "Error",
        description: "Please set your username first",
        variant: "destructive",
      });
      return false;
    }

    // In a real app, we'd fetch the game from a database or API
    // For now, we'll just simulate it by checking against our current game
    if (game && game.id === gameId) {
      if (game.status !== GameStatus.PENDING) {
        toast({
          title: "Cannot join game",
          description: "This game has already started or ended",
          variant: "destructive",
        });
        return false;
      }
      
      // Add player to the game if not already in
      if (!game.players[userId]) {
        const updatedGame = {
          ...game,
          players: {
            ...game.players,
            [userId]: {
              id: userId,
              username,
              clicks: 0,
              currentPage: game.startPage,
              finished: false,
              resigned: false,
            },
          },
        };
        
        setGame(updatedGame);
        setCurrentPlayer(updatedGame.players[userId]);
        
        toast({
          title: "Joined game successfully",
          description: `Waiting for host to start the game`,
        });
      } else {
        setCurrentPlayer(game.players[userId]);
      }
      
      return true;
    }

    toast({
      title: "Game not found",
      description: "Please check the game code",
      variant: "destructive",
    });
    return false;
  };

  const startGame = () => {
    if (!game) return;

    if (game.hostId !== userId) {
      toast({
        title: "Not allowed",
        description: "Only the host can start the game",
        variant: "destructive",
      });
      return;
    }

    const now = Date.now();
    const updatedGame: Game = {
      ...game,
      status: GameStatus.ACTIVE,
      startedAt: now,
      endAt: now + game.timeLimit * 1000,
    };

    setGame(updatedGame);
    setTimeRemaining(game.timeLimit * 1000);
    
    toast({
      title: "Game started!",
      description: `Race to ${game.endPage.split("/").pop()?.replace(/_/g, " ")}`,
    });
  };

  const handleLinkClick = (url: string) => {
    if (!game || !currentPlayer) return;

    // Update player's click count and current page
    const updatedPlayer: Player = {
      ...currentPlayer,
      clicks: currentPlayer.clicks + 1,
      currentPage: url,
    };

    const updatedGame = {
      ...game,
      players: {
        ...game.players,
        [userId]: updatedPlayer,
      },
    };

    setGame(updatedGame);
    setCurrentPlayer(updatedPlayer);
  };

  const checkGameCompletion = (currentPage: string): boolean => {
    if (!game || !currentPlayer || currentPlayer.finished) return false;
    
    // Normalize URLs for comparison
    const normalizeUrl = (url: string): string => {
      // Extract the path after /wiki/
      if (url.includes('/wiki/')) {
        return '/wiki/' + url.split('/wiki/')[1].split('#')[0].split('?')[0];
      }
      return url.split('#')[0].split('?')[0];
    };
    
    const normalizedCurrentPage = normalizeUrl(currentPage);
    const normalizedEndPage = normalizeUrl(game.endPage);
    
    console.log('Checking completion:', { 
      current: normalizedCurrentPage, 
      target: normalizedEndPage 
    });
    
    if (normalizedCurrentPage === normalizedEndPage) {
      const finishTime = Date.now();
      
      // Mark player as finished
      const updatedPlayer: Player = {
        ...currentPlayer,
        finished: true,
        finishTime,
      };

      const updatedGame = {
        ...game,
        players: {
          ...game.players,
          [userId]: updatedPlayer,
        },
      };

      setGame(updatedGame);
      setCurrentPlayer(updatedPlayer);
      
      // Calculate time taken in seconds
      const timeTaken = finishTime - (game.startedAt || finishTime);
      
      // Add to leaderboard
      updateLeaderboard();
      
      toast({
        title: "Congratulations!",
        description: `You reached the destination in ${currentPlayer.clicks} clicks and ${Math.floor(timeTaken/1000)} seconds!`,
      });
      
      return true;
    }
    
    return false;
  };

  const kickPlayer = (playerId: string) => {
    if (!game) return;

    if (game.hostId !== userId) {
      toast({
        title: "Not allowed",
        description: "Only the host can kick players",
        variant: "destructive",
      });
      return;
    }

    if (playerId === game.hostId) {
      toast({
        title: "Cannot kick host",
        description: "You cannot kick yourself as the host",
        variant: "destructive",
      });
      return;
    }

    const updatedPlayers = { ...game.players };
    delete updatedPlayers[playerId];

    setGame({
      ...game,
      players: updatedPlayers,
    });

    toast({
      title: "Player kicked",
      description: `${game.players[playerId]?.username} was removed from the game`,
    });
  };

  const resignGame = () => {
    if (!game || !currentPlayer) return;

    const updatedPlayer: Player = {
      ...currentPlayer,
      resigned: true,
    };

    const updatedGame = {
      ...game,
      players: {
        ...game.players,
        [userId]: updatedPlayer,
      },
    };

    setGame(updatedGame);
    setCurrentPlayer(updatedPlayer);
    
    toast({
      title: "Resigned from game",
      description: "You have left the current game",
    });

    // Check if all players have finished or resigned
    checkAllPlayersFinished(updatedGame);
  };

  const checkAllPlayersFinished = (gameToCheck: Game) => {
    const allFinished = Object.values(gameToCheck.players).every(
      (player) => player.finished || player.resigned
    );

    if (allFinished) {
      endGame();
    }
  };

  const endGame = () => {
    if (!game) return;

    const updatedGame: Game = {
      ...game,
      status: GameStatus.COMPLETED,
    };

    setGame(updatedGame);
    setTimeRemaining(0);
    updateLeaderboard();
  };

  const updateLeaderboard = () => {
    if (!game) return;

    const entries: LeaderboardEntry[] = Object.values(game.players)
      .filter((player) => player.finished && player.finishTime && !player.resigned)
      .map((player) => ({
        username: player.username,
        clicks: player.clicks,
        timeTaken: player.finishTime! - (game.startedAt || 0),
      }))
      .sort((a, b) => {
        // Sort by clicks first, then by time
        if (a.clicks !== b.clicks) {
          return a.clicks - b.clicks;
        }
        return a.timeTaken - b.timeTaken;
      });

    setLeaderboard(entries);
  };

  const resetGame = () => {
    setGame(null);
    setCurrentPlayer(null);
    setLeaderboard([]);
    setTimeRemaining(null);
  };

  return (
    <GameContext.Provider
      value={{
        game,
        currentPlayer,
        leaderboard,
        username,
        setUsername,
        createGame,
        joinGame,
        startGame,
        handleLinkClick,
        checkGameCompletion,
        kickPlayer,
        resignGame,
        resetGame,
        timeRemaining,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};


import React, { createContext, useContext, useState, useEffect } from "react";
import { Game, GameStatus } from "../../types/game";
import { useToast } from "@/hooks/use-toast";
import { GameContextProps, GameProviderProps } from "./types";
import { normalizeUrl, generateGameId } from "./utils";
import { useGameTimer } from "./useGameTimer";
import { useLeaderboard } from "./useLeaderboard";
import { usePlayerManager } from "./usePlayerManager";

const GameContext = createContext<GameContextProps | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameProvider");
  }
  return context;
};

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [game, setGame] = useState<Game | null>(null);
  const { toast } = useToast();
  
  const { 
    userId, 
    username, 
    currentPlayer, 
    setUsername, 
    setCurrentPlayer, 
    initializeUserId,
    updatePlayerClick,
    markPlayerFinished,
    markPlayerResigned
  } = usePlayerManager();
  
  const { leaderboard, updateLeaderboard } = useLeaderboard();
  
  const endGame = () => {
    if (!game) return;

    const updatedGame: Game = {
      ...game,
      status: GameStatus.COMPLETED,
    };

    setGame(updatedGame);
    updateLeaderboard(updatedGame);
  };
  
  const timeRemaining = useGameTimer(game, endGame);

  // Initialize user ID on component mount
  useEffect(() => {
    initializeUserId();
  }, []);

  const createGame = (startPage: string, endPage: string, timeLimit: number) => {
    if (!username || !userId) {
      toast({
        title: "Error",
        description: "Please set your username first",
        variant: "destructive",
      });
      return;
    }

    const gameId = generateGameId();
    
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
    
    toast({
      title: "Game started!",
      description: `Race to ${game.endPage.split("/").pop()?.replace(/_/g, " ")}`,
    });
  };

  const handleLinkClick = (url: string) => {
    if (!game || !currentPlayer) return;
    
    const updatedGame = updatePlayerClick(game, url);
    setGame(updatedGame);
  };

  const checkGameCompletion = (currentPage: string): boolean => {
    if (!game || !currentPlayer || currentPlayer.finished) return false;
    
    const normalizedCurrentPage = normalizeUrl(currentPage);
    const normalizedEndPage = normalizeUrl(game.endPage);
    
    console.log('Checking completion:', { 
      current: normalizedCurrentPage, 
      target: normalizedEndPage 
    });
    
    if (normalizedCurrentPage === normalizedEndPage) {
      const finishTime = Date.now();
      
      const updatedGame = markPlayerFinished(game, finishTime);
      setGame(updatedGame);
      
      updateLeaderboard(updatedGame);
      
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

    const updatedGame = markPlayerResigned(game);
    setGame(updatedGame);

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

  const resetGame = () => {
    setGame(null);
    setCurrentPlayer(null);
    updateLeaderboard(null);
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

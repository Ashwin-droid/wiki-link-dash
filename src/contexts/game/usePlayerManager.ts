
import { useState } from 'react';
import { Game, Player } from '../../types/game';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

export const usePlayerManager = () => {
  const [userId, setUserId] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const { toast } = useToast();

  // Initialize user ID on component mount
  const initializeUserId = () => {
    const storedUserId = localStorage.getItem("hyperlink-hustle-user-id");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      const newUserId = uuidv4();
      localStorage.setItem("hyperlink-hustle-user-id", newUserId);
      setUserId(newUserId);
    }
  };

  const updatePlayerClick = (game: Game, url: string): Game => {
    if (!game || !currentPlayer) return game;

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

    setCurrentPlayer(updatedPlayer);
    return updatedGame;
  };

  const markPlayerFinished = (game: Game, finishTime: number): Game => {
    if (!game || !currentPlayer) return game;

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

    setCurrentPlayer(updatedPlayer);
    
    // Calculate time taken in seconds
    const timeTaken = finishTime - (game.startedAt || finishTime);
    
    // Notify user
    toast({
      title: "Congratulations!",
      description: `You reached the destination in ${currentPlayer.clicks} clicks and ${Math.floor(timeTaken/1000)} seconds!`,
    });

    return updatedGame;
  };

  const markPlayerResigned = (game: Game): Game => {
    if (!game || !currentPlayer) return game;

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

    setCurrentPlayer(updatedPlayer);
    
    toast({
      title: "Resigned from game",
      description: "You have left the current game",
    });

    return updatedGame;
  };

  return {
    userId,
    username,
    currentPlayer,
    setUsername,
    setCurrentPlayer,
    initializeUserId,
    updatePlayerClick,
    markPlayerFinished,
    markPlayerResigned
  };
};


import { useState, useEffect } from 'react';
import { Game, GameStatus } from '../../types/game';

export const useGameTimer = (
  game: Game | null, 
  onGameEnd: () => void
): number | null => {
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!game || game.status !== GameStatus.ACTIVE || !game.endAt) {
      return;
    }

    const intervalId = setInterval(() => {
      const remaining = Math.max(0, game.endAt! - Date.now());
      setTimeRemaining(remaining);
      
      // Check for game end by timeout
      if (remaining <= 0) {
        onGameEnd();
        clearInterval(intervalId);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [game, onGameEnd]);

  return timeRemaining;
};

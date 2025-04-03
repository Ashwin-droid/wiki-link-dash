
import { useState } from 'react';
import { Game, LeaderboardEntry } from '../../types/game';

export const useLeaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  const updateLeaderboard = (game: Game | null) => {
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

  return { leaderboard, updateLeaderboard };
};

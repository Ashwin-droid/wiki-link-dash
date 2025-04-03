
import React, { useEffect, useState } from "react";
import { useGameContext } from "@/contexts/game";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatTime } from "@/lib/utils";
import { Player } from "@/types/game";

type PlayerWithStats = {
  username: string;
  clicks: number;
  finished: boolean;
  resigned: boolean;
  timeTaken?: number;
};

const CurrentLeaderboard: React.FC = () => {
  const { game } = useGameContext();
  const [playerStats, setPlayerStats] = useState<PlayerWithStats[]>([]);
  
  useEffect(() => {
    if (!game) return;
    
    // Transform players object into sorted array
    const playersArray = Object.values(game.players).map((player: Player) => {
      return {
        username: player.username,
        clicks: player.clicks,
        finished: player.finished,
        resigned: player.resigned,
        timeTaken: player.finishTime ? player.finishTime - (game.startedAt || 0) : undefined
      };
    });
    
    // Sort players: finished first (by clicks, then time), then active, then resigned
    const sortedPlayers = playersArray.sort((a, b) => {
      // Finished players at the top
      if (a.finished && !b.finished) return -1;
      if (!a.finished && b.finished) return 1;
      
      // If both finished, sort by clicks then time
      if (a.finished && b.finished) {
        if (a.clicks !== b.clicks) {
          return a.clicks - b.clicks;
        }
        return (a.timeTaken || 0) - (b.timeTaken || 0);
      }
      
      // Resigned players at the bottom
      if (a.resigned && !b.resigned) return 1;
      if (!a.resigned && b.resigned) return -1;
      
      // Otherwise sort by username
      return a.username.localeCompare(b.username);
    });
    
    setPlayerStats(sortedPlayers);
  }, [game]);

  if (!game || playerStats.length === 0) {
    return <div className="text-center py-4">No player data available</div>;
  }

  return (
    <div className="w-full">
      <h3 className="font-medium text-lg mb-3">Current Results</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Player</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Clicks</TableHead>
            <TableHead>Time</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {playerStats.map((player, index) => (
            <TableRow key={index} className={player.finished ? "bg-muted/30" : ""}>
              <TableCell className="font-medium">
                {player.finished && index === 0 ? "🥇 " : ""}
                {player.finished && index === 1 ? "🥈 " : ""}
                {player.finished && index === 2 ? "🥉 " : ""}
                {player.username}
              </TableCell>
              <TableCell>
                {player.finished 
                  ? <span className="text-green-600">Finished</span>
                  : player.resigned 
                    ? <span className="text-gray-500">Resigned</span>
                    : <span className="text-blue-500">In Progress</span>
                }
              </TableCell>
              <TableCell>{player.clicks}</TableCell>
              <TableCell>
                {player.finished && player.timeTaken
                  ? formatTime(player.timeTaken)
                  : "-"}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default CurrentLeaderboard;

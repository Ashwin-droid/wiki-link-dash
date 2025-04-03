
import React from "react";
import { useGameContext } from "@/contexts/game";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatTime } from "@/lib/utils";

interface LeaderboardProps {
  onReturn: () => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onReturn }) => {
  const { game, leaderboard } = useGameContext();

  if (!game) return null;

  const startPageName = game.startPage.split("/").pop()?.replace(/_/g, " ");
  const endPageName = game.endPage.split("/").pop()?.replace(/_/g, " ");

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Game Results</CardTitle>
        <CardDescription>
          From {startPageName} to {endPageName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {leaderboard.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Leaderboard</h3>
            <div className="rounded-md border">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-muted">
                  <tr>
                    <th className="py-2 px-4 text-left text-sm font-medium">Rank</th>
                    <th className="py-2 px-4 text-left text-sm font-medium">Player</th>
                    <th className="py-2 px-4 text-left text-sm font-medium">Clicks</th>
                    <th className="py-2 px-4 text-left text-sm font-medium">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {leaderboard.map((entry, index) => (
                    <tr key={index}>
                      <td className="py-2 px-4 whitespace-nowrap">
                        {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                      </td>
                      <td className="py-2 px-4 whitespace-nowrap">{entry.username}</td>
                      <td className="py-2 px-4 whitespace-nowrap">{entry.clicks}</td>
                      <td className="py-2 px-4 whitespace-nowrap">{formatTime(entry.timeTaken)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No players completed the challenge</p>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button onClick={onReturn}>Return to Main Menu</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default Leaderboard;

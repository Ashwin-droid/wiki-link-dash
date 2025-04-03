
import React from "react";
import { useGameContext } from "@/contexts/game";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GameStatus } from "@/types/game";

interface GameLobbyProps {
  onLeaveGame: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onLeaveGame }) => {
  const { game, currentPlayer, startGame, kickPlayer } = useGameContext();

  if (!game || !currentPlayer) {
    return null;
  }

  // Check if current player is the host
  const isHost = game.hostId === currentPlayer.id;
  const gameLink = `${window.location.origin}?gameId=${game.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(gameLink);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(game.id);
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Game Lobby</CardTitle>
        <CardDescription>
          {isHost 
            ? "Share this code with friends to join your game" 
            : "Waiting for the host to start the game"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted p-4 rounded-md text-center">
          <div className="text-sm font-medium mb-1">Game Code</div>
          <div className="text-3xl font-bold tracking-wider">{game.id}</div>
          <div className="mt-2 flex justify-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleCopyCode}>
              Copy Code
            </Button>
            <Button variant="outline" size="sm" onClick={handleCopyLink}>
              Copy Link
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Game Settings</h3>
          <div className="bg-muted rounded-md p-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div className="font-medium">Start Page:</div>
              <div>{game.startPage.split("/").pop()?.replace(/_/g, " ")}</div>
              <div className="font-medium">End Page:</div>
              <div>{game.endPage.split("/").pop()?.replace(/_/g, " ")}</div>
              <div className="font-medium">Time Limit:</div>
              <div>{game.timeLimit} seconds</div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Players ({Object.keys(game.players).length})</h3>
          <div className="space-y-1">
            {Object.values(game.players).map((player) => (
              <div 
                key={player.id} 
                className="flex items-center justify-between bg-muted rounded-md p-2"
              >
                <div className="flex items-center">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                  <span>{player.username}</span>
                  {player.id === game.hostId && (
                    <span className="ml-2 text-xs bg-primary text-white px-1 py-0.5 rounded">Host</span>
                  )}
                </div>
                {isHost && player.id !== game.hostId && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => kickPlayer(player.id)}
                    className="h-7 text-xs"
                  >
                    Kick
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="outline" onClick={onLeaveGame}>
            Leave Game
          </Button>
          {isHost && (
            <Button 
              onClick={startGame}
              disabled={Object.keys(game.players).length < 1}
            >
              Start Game
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default GameLobby;

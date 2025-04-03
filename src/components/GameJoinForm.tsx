
import React, { useState } from "react";
import { useGameContext } from "@/contexts/game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface GameJoinFormProps {
  onGoBack: () => void;
  onGameJoined: () => void;
}

const GameJoinForm: React.FC<GameJoinFormProps> = ({ onGoBack, onGameJoined }) => {
  const [gameCode, setGameCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  const { joinGame } = useGameContext();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!gameCode.trim()) return;
    
    setIsJoining(true);
    try {
      const joined = joinGame(gameCode.trim().toUpperCase());
      if (joined) {
        onGameJoined();
      }
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Join a Game</CardTitle>
        <CardDescription>Enter the game code provided by the host</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="gameCode" className="text-sm font-medium">
              Game Code
            </label>
            <Input
              id="gameCode"
              type="text"
              value={gameCode}
              onChange={(e) => setGameCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              className="w-full uppercase"
              maxLength={8}
              autoFocus
            />
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onGoBack}>
              Back
            </Button>
            <Button 
              type="submit" 
              disabled={isJoining || !gameCode.trim()}
            >
              {isJoining ? "Joining..." : "Join Game"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GameJoinForm;

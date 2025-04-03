
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGameContext } from "@/contexts/GameContext";

interface MainMenuProps {
  onHostGame: () => void;
  onJoinGame: () => void;
}

const MainMenu: React.FC<MainMenuProps> = ({ onHostGame, onJoinGame }) => {
  const { username } = useGameContext();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Hyperlink Hustle</CardTitle>
        <CardDescription>
          Welcome, {username}! Choose an option to continue.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4">
        <Button size="lg" onClick={onHostGame}>
          Host a New Game
        </Button>
        <Button size="lg" variant="outline" onClick={onJoinGame}>
          Join a Game
        </Button>
      </CardContent>
    </Card>
  );
};

export default MainMenu;

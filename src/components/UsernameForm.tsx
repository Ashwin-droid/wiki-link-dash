
import React, { useState } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface UsernameFormProps {
  onComplete: () => void;
}

const UsernameForm: React.FC<UsernameFormProps> = ({ onComplete }) => {
  const { username, setUsername } = useGameContext();
  const [tempUsername, setTempUsername] = useState(username || "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      onComplete();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome to Hyperlink Hustle!</CardTitle>
        <CardDescription>
          Race through Wikipedia to reach the goal page using the fewest possible clicks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Enter your username to begin
            </label>
            <Input
              id="username"
              type="text"
              value={tempUsername}
              onChange={(e) => setTempUsername(e.target.value)}
              placeholder="Your username"
              className="w-full"
              autoFocus
            />
          </div>
          <Button type="submit" className="w-full" disabled={!tempUsername.trim()}>
            Continue
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default UsernameForm;

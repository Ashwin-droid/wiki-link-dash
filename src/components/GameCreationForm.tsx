
import React, { useState } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/components/ui/use-toast";

interface GameCreationFormProps {
  onGoBack: () => void;
  onGameCreated: (gameId: string) => void;
}

const GameCreationForm: React.FC<GameCreationFormProps> = ({ onGoBack, onGameCreated }) => {
  const [startPage, setStartPage] = useState("");
  const [endPage, setEndPage] = useState("");
  const [timeLimit, setTimeLimit] = useState(300); // 5 minutes default
  const [isCreating, setIsCreating] = useState(false);
  const { createGame } = useGameContext();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startPage || !endPage) {
      toast({
        title: "Missing information",
        description: "Please select both start and end pages",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    
    try {
      // In a real implementation, we would validate that these are actual Wikipedia pages
      const formattedStartPage = formatWikiUrl(startPage);
      const formattedEndPage = formatWikiUrl(endPage);
      
      const gameId = createGame(formattedStartPage, formattedEndPage, timeLimit);
      if (gameId) {
        onGameCreated(gameId);
      }
    } catch (error) {
      toast({
        title: "Failed to create game",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  // Helper function to format Wikipedia URLs consistently
  const formatWikiUrl = (input: string): string => {
    // Basic formatting - in a real app, we'd use the Wikipedia API
    let page = input.trim();
    
    // If it's a full URL, extract the page name
    if (page.includes("wikipedia.org/wiki/")) {
      page = page.split("/wiki/")[1];
    }
    
    // Replace spaces with underscores for Wikipedia format
    page = page.replace(/\s+/g, "_");
    
    return "/wiki/" + page;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl">Create a New Game</CardTitle>
        <CardDescription>Set up your Hyperlink Hustle challenge</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="startPage" className="text-sm font-medium">
              Start Wikipedia Page
            </label>
            <Input
              id="startPage"
              type="text"
              value={startPage}
              onChange={(e) => setStartPage(e.target.value)}
              placeholder="e.g. Albert Einstein or /wiki/Albert_Einstein"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="endPage" className="text-sm font-medium">
              End Wikipedia Page
            </label>
            <Input
              id="endPage"
              type="text"
              value={endPage}
              onChange={(e) => setEndPage(e.target.value)}
              placeholder="e.g. Quantum Physics or /wiki/Quantum_physics"
              className="w-full"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="timeLimit" className="text-sm font-medium">
              Time Limit: {timeLimit} seconds
            </label>
            <Slider
              id="timeLimit"
              min={60}
              max={3600}
              step={30}
              value={[timeLimit]}
              onValueChange={(values) => setTimeLimit(values[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1 minute</span>
              <span>60 minutes</span>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button type="button" variant="outline" onClick={onGoBack}>
              Back
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? "Creating..." : "Create Game"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default GameCreationForm;

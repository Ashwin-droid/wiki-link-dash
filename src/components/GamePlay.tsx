
import React, { useEffect, useRef, useState } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GameStatus } from "@/types/game";
import { formatTime } from "@/lib/utils";
import CurrentLeaderboard from "@/components/CurrentLeaderboard";

const GamePlay: React.FC = () => {
  const { 
    game, 
    currentPlayer, 
    handleLinkClick,
    checkGameCompletion,
    resignGame,
    timeRemaining 
  } = useGameContext();
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const startPageName = game?.startPage?.split("/").pop()?.replace(/_/g, " ") || "";
  const endPageName = game?.endPage?.split("/").pop()?.replace(/_/g, " ") || "";

  const handleIframeLoad = () => {
    setLoading(false);
    
    if (!iframeRef.current || !iframeRef.current.contentWindow) return;
    
    try {
      // Get the current page URL
      const iframe = iframeRef.current;
      const contentWindow = iframe.contentWindow;
      const currentUrl = contentWindow.location.pathname;
      
      // Check if player reached the goal
      const completed = checkGameCompletion(currentUrl);
      
      // If player reached the goal, don't set up any more link handlers
      if (completed) return;
      
      // Add click event listeners to all internal links within the iframe
      const links = contentWindow.document.querySelectorAll('a');
      
      links.forEach((link) => {
        const href = link.getAttribute('href');
        
        if (href && href.startsWith('/wiki/')) {
          // Replace the original click event
          link.onclick = (e) => {
            e.preventDefault();
            
            // Add the click to the counter and update the current page
            handleLinkClick(href);
            
            // Navigate within the iframe
            contentWindow.location.href = `https://en.wikipedia.org${href}`;
          };
        } else if (href && !href.startsWith('#')) {
          // Disable external links
          link.onclick = (e) => {
            e.preventDefault();
            return false;
          };
          link.style.textDecoration = "line-through";
          link.style.opacity = "0.5";
          link.title = "External links are disabled";
        }
      });
    } catch (error) {
      console.error("Error manipulating iframe:", error);
    }
  };

  // Calculate progress percentage based on time remaining
  const progressPercentage = timeRemaining !== null && game?.timeLimit 
    ? (timeRemaining / (game.timeLimit * 1000)) * 100
    : 100;

  const isFinished = currentPlayer?.finished || false;
  const hasResigned = currentPlayer?.resigned || false;
  const gameEnded = game?.status === GameStatus.COMPLETED;

  useEffect(() => {
    setLoading(true);
  }, []);

  if (!game || !currentPlayer) return null;

  return (
    <div className="w-full flex flex-col">
      <Card className="mb-2 px-4 py-3 game-header text-white flex justify-between items-center">
        <div>
          <h3 className="font-medium">Target: {endPageName}</h3>
          <p className="text-sm">Find the shortest path from {startPageName}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold">{formatTime(timeRemaining || 0)}</div>
          <div className="text-sm">Clicks: {currentPlayer.clicks}</div>
        </div>
      </Card>
      
      <div className="mb-4">
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      {(isFinished || hasResigned || gameEnded) ? (
        <div className="w-full flex-1 flex flex-col bg-muted rounded-md p-6">
          <div className="text-center mb-6">
            {isFinished ? (
              <h2 className="text-2xl font-bold mb-2">You reached the destination!</h2>
            ) : hasResigned ? (
              <h2 className="text-2xl font-bold mb-2">You resigned from the game</h2>
            ) : (
              <h2 className="text-2xl font-bold mb-2">Game has ended</h2>
            )}
            <p className="text-muted-foreground">
              {isFinished 
                ? `You completed the challenge in ${currentPlayer.clicks} clicks.` 
                : "Waiting for other players to finish..."}
            </p>
          </div>
          
          <div className="flex-1">
            <CurrentLeaderboard />
          </div>
        </div>
      ) : (
        <div className="relative flex-1">
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted">
              <div className="text-center">
                <div className="animate-pulse-slow mb-2">Loading Wikipedia...</div>
                <div className="text-sm text-muted-foreground">This may take a few seconds</div>
              </div>
            </div>
          )}
          <iframe 
            ref={iframeRef}
            src={`https://en.wikipedia.org${game.startPage}`}
            className="wiki-iframe"
            onLoad={handleIframeLoad}
            title="Wikipedia"
          />
          
          <div className="mt-4 flex justify-between">
            <Button variant="outline" onClick={resignGame}>
              Resign
            </Button>
            <div className="text-sm text-muted-foreground self-center">
              {currentPlayer.clicks} clicks made so far
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GamePlay;

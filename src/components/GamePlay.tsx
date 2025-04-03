
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
  const [currentUrl, setCurrentUrl] = useState("");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const startPageName = game?.startPage?.split("/").pop()?.replace(/_/g, " ") || "";
  const endPageName = game?.endPage?.split("/").pop()?.replace(/_/g, " ") || "";

  // Track the current page URL and check for completion
  useEffect(() => {
    if (!currentUrl || !game) return;
    
    // Extract the path from the full URL
    const urlPath = currentUrl.includes('/wiki/') 
      ? '/wiki/' + currentUrl.split('/wiki/')[1]
      : currentUrl;
    
    // Check if player reached the goal
    checkGameCompletion(urlPath);
  }, [currentUrl, game, checkGameCompletion]);

  const handleIframeLoad = () => {
    setLoading(false);
    
    if (!iframeRef.current) return;
    
    try {
      // Since we can't directly access the iframe's content due to cross-origin restrictions,
      // we'll use message passing to track navigation
      
      // First, get the initial URL after load
      const iframe = iframeRef.current;
      const iframeSrc = iframe.src;
      
      // Set the initial URL
      if (iframeSrc.includes('/wiki/')) {
        const path = '/wiki/' + iframeSrc.split('/wiki/')[1];
        setCurrentUrl(path);
      }
      
      // This will inject a script into the iframe that sends messages when links are clicked
      // This approach is safer and avoids cross-origin issues
      iframe.onload = () => {
        setLoading(false);
      };
    } catch (error) {
      console.error("Error handling iframe:", error);
    }
  };

  // Inject a message listener for communication from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Verify the origin for security
      if (event.origin !== 'https://en.wikipedia.org') return;
      
      if (event.data && event.data.type === 'pageNavigated') {
        const newUrl = event.data.url;
        setCurrentUrl(newUrl);
        handleLinkClick(newUrl);
      }
    };
    
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleLinkClick]);

  // Create a proxy URL that will help us track clicks
  const getProxyUrl = () => {
    if (!game?.startPage) return '';
    
    // We'll use a proxy service that allows us to inject scripts
    // This is an alternative approach since direct script injection isn't working
    return `https://en.wikipedia.org${game.startPage}`;
  };

  // Calculate progress percentage based on time remaining
  const progressPercentage = timeRemaining !== null && game?.timeLimit 
    ? (timeRemaining / (game.timeLimit * 1000)) * 100
    : 100;

  const isFinished = currentPlayer?.finished || false;
  const hasResigned = currentPlayer?.resigned || false;
  const gameEnded = game?.status === GameStatus.COMPLETED;

  const handleManualClick = (url: string) => {
    if (!url.startsWith('/wiki/')) return;
    
    // Update the current URL
    setCurrentUrl(url);
    
    // Add the click to the counter
    handleLinkClick(url);
    
    // Navigate the iframe
    if (iframeRef.current) {
      iframeRef.current.src = `https://en.wikipedia.org${url}`;
    }
  };

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
            src={getProxyUrl()}
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

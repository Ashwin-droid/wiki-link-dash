
import React, { useEffect, useState, useCallback } from "react";
import { useGameContext } from "@/contexts/GameContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { GameStatus } from "@/types/game";
import { formatTime } from "@/lib/utils";
import CurrentLeaderboard from "@/components/CurrentLeaderboard";
import { useToast } from "@/hooks/use-toast";

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
  const [currentHtml, setCurrentHtml] = useState("");
  const [currentArticle, setCurrentArticle] = useState("");
  const { toast } = useToast();
  
  const startPageName = game?.startPage?.split("/").pop()?.replace(/_/g, " ") || "";
  const endPageName = game?.endPage?.split("/").pop()?.replace(/_/g, " ") || "";

  // Function to fetch Wikipedia article HTML
  const fetchWikiHtml = useCallback(async (articleTitle: string): Promise<string> => {
    setLoading(true);
    try {
      const formattedTitle = articleTitle.startsWith('/wiki/') 
        ? articleTitle.substring(6) // Remove /wiki/ prefix
        : articleTitle;
        
      const res = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/html/${encodeURIComponent(formattedTitle)}`
      );
      
      if (!res.ok) {
        throw new Error(`Failed to fetch article: ${res.status}`);
      }
      
      let html = await res.text();
      
      // Process the links to make them work within our app
      html = html.replace(
        /href="\/wiki\/([^"#]+)([#][^"]*)?"/g,
        (match, articleSlug, hash = "") => {
          // Convert regular wiki links into data attributes we can handle
          return `href="javascript:void(0)" class="wiki-link" data-article="${articleSlug}"${hash ? ` data-section="${hash.substring(1)}"` : ''}`;
        }
      );
      
      return html;
    } catch (error) {
      console.error("Error fetching Wikipedia article:", error);
      toast({
        title: "Error",
        description: "Failed to load Wikipedia article",
        variant: "destructive",
      });
      return "<div>Failed to load article. Please try again.</div>";
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Load initial article when game starts
  useEffect(() => {
    if (game?.startPage && (!currentArticle || currentArticle === "")) {
      const articleTitle = game.startPage.startsWith('/wiki/') 
        ? game.startPage.substring(6) 
        : game.startPage;
        
      setCurrentArticle(articleTitle);
      fetchWikiHtml(articleTitle).then(html => setCurrentHtml(html));
    }
  }, [game, fetchWikiHtml, currentArticle]);

  // Handle wiki link click
  const handleWikiLinkClick = useCallback((e: MouseEvent) => {
    // Get the clicked element
    const target = e.target as HTMLElement;
    
    // Find if it's a wiki link or a child of a wiki link
    const wikiLink = target.closest('.wiki-link');
    
    if (wikiLink) {
      e.preventDefault();
      e.stopPropagation();
      
      const articleName = wikiLink.getAttribute('data-article');
      
      if (articleName) {
        const newUrl = `/wiki/${articleName}`;
        
        // Update game state with the new click
        handleLinkClick(newUrl);
        
        // Check if the user has reached the goal
        const gameCompleted = checkGameCompletion(newUrl);
        
        if (!gameCompleted) {
          // If game is not complete, load the new article
          setCurrentArticle(articleName);
          fetchWikiHtml(articleName).then(html => setCurrentHtml(html));
        }
      }
    }
  }, [handleLinkClick, checkGameCompletion, fetchWikiHtml]);

  // Set up event listener for wiki content
  useEffect(() => {
    const wikiContent = document.querySelector('.wiki-content');
    
    if (wikiContent) {
      wikiContent.addEventListener('click', handleWikiLinkClick);
    }
    
    return () => {
      if (wikiContent) {
        wikiContent.removeEventListener('click', handleWikiLinkClick);
      }
    };
  }, [currentHtml, handleWikiLinkClick]);

  // Calculate progress percentage based on time remaining
  const progressPercentage = timeRemaining !== null && game?.timeLimit 
    ? (timeRemaining / (game.timeLimit * 1000)) * 100
    : 100;

  const isFinished = currentPlayer?.finished || false;
  const hasResigned = currentPlayer?.resigned || false;
  const gameEnded = game?.status === GameStatus.COMPLETED;

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
            <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
              <div className="text-center">
                <div className="animate-pulse mb-2">Loading Wikipedia...</div>
                <div className="text-sm text-muted-foreground">This may take a few seconds</div>
              </div>
            </div>
          )}
          
          <div className="wiki-content bg-white p-4 rounded-lg border border-gray-200 overflow-auto h-[70vh]">
            <div dangerouslySetInnerHTML={{ __html: currentHtml }} />
          </div>
          
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

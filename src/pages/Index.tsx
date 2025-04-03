
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import UsernameForm from "@/components/UsernameForm";
import MainMenu from "@/components/MainMenu";
import GameCreationForm from "@/components/GameCreationForm";
import GameJoinForm from "@/components/GameJoinForm";
import GameLobby from "@/components/GameLobby";
import GamePlay from "@/components/GamePlay";
import Leaderboard from "@/components/Leaderboard";
import { useGameContext } from "@/contexts/GameContext";
import { GameStatus } from "@/types/game";

enum GameScreen {
  USERNAME,
  MAIN_MENU,
  CREATE_GAME,
  JOIN_GAME,
  GAME_LOBBY,
  GAME_PLAY,
  LEADERBOARD
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<GameScreen>(GameScreen.USERNAME);
  const { game, username, joinGame, resetGame } = useGameContext();
  const location = useLocation();

  // Check for game ID in URL when component mounts
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const gameId = params.get("gameId");
    
    if (gameId && username) {
      joinGame(gameId);
      setCurrentScreen(GameScreen.GAME_LOBBY);
    }
  }, [location, username]);

  // Update screen based on game state
  useEffect(() => {
    if (!game) return;

    if (game.status === GameStatus.ACTIVE) {
      setCurrentScreen(GameScreen.GAME_PLAY);
    } else if (game.status === GameStatus.COMPLETED) {
      setCurrentScreen(GameScreen.LEADERBOARD);
    }
  }, [game]);

  const handleUsernameComplete = () => {
    setCurrentScreen(GameScreen.MAIN_MENU);
  };

  const handleHostGame = () => {
    setCurrentScreen(GameScreen.CREATE_GAME);
  };

  const handleJoinGame = () => {
    setCurrentScreen(GameScreen.JOIN_GAME);
  };

  const handleGameCreated = (gameId: string) => {
    setCurrentScreen(GameScreen.GAME_LOBBY);
  };

  const handleGameJoined = () => {
    setCurrentScreen(GameScreen.GAME_LOBBY);
  };

  const handleLeaveGame = () => {
    resetGame();
    setCurrentScreen(GameScreen.MAIN_MENU);
  };

  const handleReturnToMenu = () => {
    resetGame();
    setCurrentScreen(GameScreen.MAIN_MENU);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold text-center">Hyperlink Hustle</h1>
        </div>
      </header>
      
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        {currentScreen === GameScreen.USERNAME && (
          <UsernameForm onComplete={handleUsernameComplete} />
        )}
        
        {currentScreen === GameScreen.MAIN_MENU && (
          <MainMenu onHostGame={handleHostGame} onJoinGame={handleJoinGame} />
        )}
        
        {currentScreen === GameScreen.CREATE_GAME && (
          <GameCreationForm 
            onGoBack={() => setCurrentScreen(GameScreen.MAIN_MENU)} 
            onGameCreated={handleGameCreated} 
          />
        )}
        
        {currentScreen === GameScreen.JOIN_GAME && (
          <GameJoinForm 
            onGoBack={() => setCurrentScreen(GameScreen.MAIN_MENU)} 
            onGameJoined={handleGameJoined} 
          />
        )}
        
        {currentScreen === GameScreen.GAME_LOBBY && (
          <GameLobby onLeaveGame={handleLeaveGame} />
        )}
        
        {currentScreen === GameScreen.GAME_PLAY && <GamePlay />}
        
        {currentScreen === GameScreen.LEADERBOARD && (
          <Leaderboard onReturn={handleReturnToMenu} />
        )}
      </main>
      
      <footer className="bg-white border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-gray-500">
          Hyperlink Hustle &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default Index;

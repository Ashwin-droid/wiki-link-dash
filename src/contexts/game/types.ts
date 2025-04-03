
import { Game, Player, LeaderboardEntry } from "../../types/game";

export interface GameContextProps {
  game: Game | null;
  currentPlayer: Player | null;
  leaderboard: LeaderboardEntry[];
  username: string;
  setUsername: (username: string) => void;
  createGame: (startPage: string, endPage: string, timeLimit: number) => void;
  joinGame: (gameId: string) => boolean;
  startGame: () => void;
  handleLinkClick: (url: string) => void;
  checkGameCompletion: (currentPage: string) => boolean;
  kickPlayer: (playerId: string) => void;
  resignGame: () => void;
  resetGame: () => void;
  timeRemaining: number | null;
}

export interface GameProviderProps {
  children: React.ReactNode;
}

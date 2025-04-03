
export enum GameStatus {
  PENDING = "pending",
  ACTIVE = "active",
  COMPLETED = "completed",
}

export interface Player {
  id: string;
  username: string;
  clicks: number;
  currentPage: string;
  finished: boolean;
  finishTime?: number;
  resigned: boolean;
}

export interface Game {
  id: string;
  hostId: string;
  startPage: string;
  endPage: string;
  timeLimit: number;
  status: GameStatus;
  startedAt?: number;
  endAt?: number;
  players: Record<string, Player>;
}

export interface LeaderboardEntry {
  username: string;
  clicks: number;
  timeTaken: number;
}

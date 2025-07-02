export type Player = {
  id: number;
  name: string;
  kills?: number;
  deaths?: number;
  health: number;
  score?: number;
  isAlive?: boolean;
};

// Shot broadcast event from the server
export type ShotEvent = {
  killer: Player;
  target: Player;
};

// Keep these exported for future use
export interface PlayerRegisterProps {
  name: string;
  tagId: number;
}

export type GameState = {
  players: Player[];
  currentPlayerId: string;
  gameStarted: boolean;
  gameEnded: boolean;
  leaderboard: Player[];
};

export type Game = {
  id: string;
  players: Player[];
  status: "waiting" | "active" | "ended";
};

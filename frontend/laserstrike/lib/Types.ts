export type Player = {
  id: string;
  name: string;
  kills?: number;
  deaths?: number;
    health:number;
};

declare interface PlayerRegisterProps {
  name: string;
  tagId: string;
}

declare type GameState = {
  players: Player[];
  currentPlayerId: string;
  gameStarted: boolean;
  gameEnded: boolean;
  leaderboard: Player[];
};

declare type Game = {
  id: string;
};

import { WorldItem } from "../items/all";

export type ItemForWealthIndex = {
  _id: string;
  count: number;
  rarity: number;
};

export type FullLeaderboardPlayer = {
  username: string;
  items: number;
  wealth_index: number;
};

export type FullLeaderboardResponse = {
  players: FullLeaderboardPlayer[];
};

export type InventoryResponse = {
  total: number;
  items: WorldItem[];
  wealth_index: number;
  location: string;
  spawn_date: Date | null;
  players_in_zone: number;
};

export type LeaderboardPlayer = {
  username: string;
  image_url: string;
  items: number;
  wealth_index: number;
};

export type SpawnedItem = {
  name: string;
  number?: number;
  zone?: string;
  createdAt?: Date;
  rarity: number;
};

export type Population = {
  [key: string]: number;
};

export type MetaResponse = {
  leaderboard: LeaderboardPlayer[];
  latestSpawned: SpawnedItem;
  mostSpawned: SpawnedItem;
  leastSpawned: SpawnedItem;
  population: Population;
};

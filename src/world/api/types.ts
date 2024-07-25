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

export type PlayerWithItem = {
  player: {
    username: string;
    image_url: string;
  };
  item: {
    name: string;
    rarity: number;
    zone: string;
  };
};

export type NewestPlayer = {
  username: string;
  image_url: string;
  zone: string;
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
  latestSpawned: SpawnedItem;
  mostSpawned: SpawnedItem;
  leastSpawned: SpawnedItem;
  population: Population;
  latestClaim: PlayerWithItem;
  newestPlayer: NewestPlayer;
};

export type WorldItem = {
  name: string;
  rarity: number;
  onlyZone: string | null;
  flavours?: string[];
  cooked?: boolean;
};

export type SpawnedItem = {
  createdAt?: Date;
  name: string;
  number?: number;
  rarity: number;
  zone?: string;
};

export type ItemForWealthIndex = {
  _id: string;
  count: number;
  rarity: number;
};

export type Player = {
  username: string;
  image_url?: string;
  items?: number;
  wealth_index?: number;
  zone?: string;
};

export type PlayerWithItem = {
  player: Player;
  item: SpawnedItem;
};

export type FullLeaderboardResponse = {
  players: Player[];
};

export type InventoryResponse = {
  total: number;
  items: WorldItem[];
  wealth_index: number;
  location: string;
  spawn_date: Date | null;
  players_in_zone: number;
};

export type Population = {
  [key: string]: number;
};

export type MetaResponse = {
  latestSpawned: SpawnedItem;
  mostSpawned: SpawnedItem;
  leastSpawned: SpawnedItem;
  population: Population;
  latestClaim: {
    player: Player;
    item: SpawnedItem;
  };
  newestPlayer: Player;
};

export type RecipeMeta = {
  title: string;
  description: string;
};

export type RecipesResponse = RecipeMeta[];

export enum PantherworldEvent {
  CLAIM = "claim",
  COOK_FAILED = "cook_failed",
  COOKED = "cooked",
  THROW = "throw",
  GIFT = "gift",
  MOVE = "move",
  SPAWN = "spawn",
  RELEASE = "release",
  LEADERBOARD = "leaderboard",
  LIST_POPULATION = "list_population",
  LOCK = "lock",
}

export type Recipe = {
  title: string;
  description: string;
  names: string[];
  ingredients: {
    primary: WorldItem;
    secondary: WorldItem[];
  };
};

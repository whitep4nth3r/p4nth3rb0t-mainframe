import * as Sentry from "@sentry/node";
import PantherworldItemModel from "../data/models/PantherworldItem";
import PantherworldPlayerModel, {
  PantherworldPlayerData,
} from "../data/models/PantherworldPlayer";
import UserManager from "../users/UserManager";
import { WorldItem } from "./items/all";

type InventoryResponse = {
  total: number;
  items: WorldItem[];
  location: string;
  spawn_date: Date | null;
  players_in_zone: number;
};

type LeaderBoardPlayer = {
  username: string;
  items: number;
};

type SpawnedItem = {
  name: string;
  number?: number;
  zone?: string;
  createdAt?: Date;
  rarity: number;
};

type Population = {
  [key: string]: number;
};

type MetaResponse = {
  leaderboard: LeaderBoardPlayer[];
  latestSpawned: SpawnedItem;
  mostSpawned: SpawnedItem;
  leastSpawned: SpawnedItem;
  population: Population;
};

export async function getLocation(userId: string): Promise<string> {
  const entry = await PantherworldPlayerModel.findOne({
    userId: userId,
  });
  if (entry) {
    return entry.zone;
  } else {
    return "Not found";
  }
}

export async function getMeta(): Promise<MetaResponse> {
  // leaderboard
  const top3Users = await PantherworldItemModel.aggregate([
    { $match: { userId: { $ne: null } } },

    // Group documents by userId, count the number of items in each group
    { $group: { _id: "$userId", itemCount: { $sum: 1 } } },

    // Sort the groups by itemCount in ascending order
    { $sort: { itemCount: -1 } },

    { $limit: 3 },
  ]);

  const leaderboard = [];

  const promises = top3Users.map(async (item) => {
    const user = await UserManager.getUserById(item._id);

    if (user) {
      leaderboard.push({
        username: user.display_name,
        items: item.itemCount,
      });
    }
  });

  await Promise.all(promises)
    .then()
    .catch((err) => {
      Sentry.captureException(err);
    });

  //population
  const zoneCounts = await PantherworldPlayerModel.aggregate([
    { $group: { _id: "$zone", count: { $sum: 1 } } },
  ]);

  const population: Population = {};

  zoneCounts.forEach((zone) => {
    population[zone._id] = zone.count;
  });

  // latest spawned
  const recentItem = await PantherworldItemModel.aggregate([
    { $sort: { createdAt: -1 } },
    { $limit: 1 },
  ]);

  // most and least spawned
  const spawnedItems = await PantherworldItemModel.aggregate([
    // Group documents by name, count the number of items in each group
    {
      $group: {
        _id: "$name",
        count: { $sum: 1 },
        rarity: { $first: "$rarity" },
      },
    },

    // Sort the groups by count in descending order
    { $sort: { count: -1 } },
  ]);

  return {
    leaderboard,
    latestSpawned: {
      name: recentItem[0].name,
      zone: recentItem[0].zone,
      createdAt: recentItem[0].createdAt,
      rarity: recentItem[0].rarity,
    },
    mostSpawned: {
      name: spawnedItems[0]._id,
      number: spawnedItems[0].count,
      rarity: spawnedItems[0].rarity,
    },
    leastSpawned: {
      name: spawnedItems[spawnedItems.length - 1]._id,
      number: spawnedItems[spawnedItems.length - 1].count,
      rarity: spawnedItems[spawnedItems.length - 1].rarity,
    },
    population,
  };
}

export async function getFullInventory(
  userId: string,
): Promise<InventoryResponse> {
  const items = await PantherworldItemModel.aggregate([
    // Match documents with a specific userId
    { $match: { userId: userId } },

    // Group documents by name, count the number of items in each group
    {
      $group: {
        _id: "$name",
        rarity: { $first: "$rarity" },
        count: { $sum: 1 },
      },
    },

    // Project to rename _id to name
    {
      $project: {
        _id: 0,
        name: "$_id",
        count: 1,
        rarity: 1,
      },
    },

    // Sort the groups by rarity in descending order
    { $sort: { rarity: -1 } },
  ]);

  let total = 0;

  items.forEach((item) => (total += item.count));

  let locationString = "Not found";
  let spawnDateString = null;
  let playersInZone = 0;

  const player = (await PantherworldPlayerModel.findOne({
    userId: userId,
  })) as PantherworldPlayerData;

  if (player) {
    locationString = player.zone;
    spawnDateString = player.createdAt;

    const otherPlayers = await PantherworldPlayerModel.find({
      zone: player.zone,
    });

    playersInZone = otherPlayers.length;
  }

  return {
    total,
    items,
    location: locationString,
    spawn_date: spawnDateString,
    players_in_zone: playersInZone,
  };
}

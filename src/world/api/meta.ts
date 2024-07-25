import * as Sentry from "@sentry/node";
import { LeaderboardPlayer, MetaResponse, Population } from "./types";
import PantherworldItemModel from "../../data/models/PantherworldItem";
import PantherworldPlayerModel from "../../data/models/PantherworldPlayer";
import UserManager from "../../users/UserManager";
import { getWealthIndex } from "../actions/wealth/wealthDistribution";
import { getAllItemsForPlayerToCalculateWealthIndex } from "./player/allItems";

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
    const allItems = await getAllItemsForPlayerToCalculateWealthIndex(item._id);

    if (user) {
      leaderboard.push({
        username: user.display_name,
        image_url: user.profile_image_url,
        items: item.itemCount,
        wealth_index: getWealthIndex(allItems),
      } as LeaderboardPlayer);
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

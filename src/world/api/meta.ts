import { FullTwitchUser } from "./../../data/types";
import PantherworldItemModel from "../../data/models/PantherworldItem";
import PantherworldPlayerModel from "../../data/models/PantherworldPlayer";
import UserManager from "../../users/UserManager";
import { MetaResponse, Population } from "./types";

export async function getMeta(): Promise<MetaResponse> {
  const mostRecentUpdatedItem = await PantherworldItemModel.findOne(
    { userId: { $ne: null } },
    { sort: { updatedAt: 1 } },
    {
      projection: { rarity: 1, name: 1, zone: 1, userId: 1 },
    },
  );

  const latestClaimAsTwitchUser: FullTwitchUser = await UserManager.getUserById(
    mostRecentUpdatedItem.userId,
  );

  const latestClaim = {
    player: {
      username: latestClaimAsTwitchUser.display_name,
      image_url: latestClaimAsTwitchUser.profile_image_url,
    },
    item: {
      name: mostRecentUpdatedItem.name,
      rarity: mostRecentUpdatedItem.rarity,
      zone: mostRecentUpdatedItem.zone,
    },
  };

  // newest player
  const mostRecentlyCreatedPlayer = await PantherworldPlayerModel.findOne(
    {},
    {
      sort: { createdAt: 1 },
    },
    {
      projection: { zone: 1, userId: 1 },
    },
  );

  const newestPlayerAsTwitchUser: FullTwitchUser =
    await UserManager.getUserById(mostRecentlyCreatedPlayer.userId);

  const newestPlayer = {
    username: newestPlayerAsTwitchUser.display_name,
    image_url: newestPlayerAsTwitchUser.profile_image_url,
    zone: mostRecentlyCreatedPlayer.zone,
  };

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
    latestClaim,
    newestPlayer,
  };
}

import PantherworldItemModel, {
  PantherworldItemData,
} from "./../../data/models/PantherworldItem";
import { FullTwitchUser } from "./../../data/types";
import PantherworldPlayerModel from "../../data/models/PantherworldPlayer";
import UserManager from "../../users/UserManager";
import { MetaResponse, Population } from "./types";

export async function getMeta(): Promise<MetaResponse> {
  const mostRecentUpdatedItem = (
    await PantherworldItemModel.aggregate([
      {
        $match: {
          userId: { $ne: null },
          used: { $ne: true },
          spoiled: { $nd: true },
          cooked: { $nd: true },
        },
      },
      { $sort: { updatedAt: -1 } }, // Sort documents by updatedAt in descending order
      { $limit: 1 }, // Limit the result to 1 document
      {
        $project: {
          // Specify the fields to include
          _id: 0, // Exclude the _id field
          rarity: 1,
          name: 1,
          zone: 1,
          userId: 1,
        },
      },
    ])
  ).pop() as PantherworldItemData;

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

  // most recent cook
  const mostRecentCook = (
    await PantherworldItemModel.aggregate([
      { $match: { userId: { $ne: null }, cooked: true } }, // Filter documents where userId is not null and item cooked
      { $sort: { updatedAt: -1 } }, // Sort documents by updatedAt in descending order
      { $limit: 1 }, // Limit the result to 1 document
      {
        $project: {
          // Specify the fields to include
          _id: 0, // Exclude the _id field
          rarity: 1,
          name: 1,
          zone: 1,
          userId: 1,
        },
      },
    ])
  ).pop() as PantherworldItemData;

  const mostRecentCookAsTwitchUser: FullTwitchUser =
    await UserManager.getUserById(mostRecentCook.userId);

  const latestCook = {
    player: {
      username: mostRecentCookAsTwitchUser.display_name,
      image_url: mostRecentCookAsTwitchUser.profile_image_url,
    },
    item: {
      name: mostRecentCook.name,
      rarity: mostRecentCook.rarity,
      zone: mostRecentCook.zone,
    },
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
    {
      $match: {
        cooked: null,
      },
    },
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
    latestCook: latestCook,
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
  };
}

import PantherworldItemModel from "../../data/models/PantherworldItem";
import PantherworldPlayerModel from "../../data/models/PantherworldPlayer";
import { MetaResponse, Population } from "./types";

export async function getMeta(): Promise<MetaResponse> {

  // latest claimer
  // newest player
  // 


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
  };
}

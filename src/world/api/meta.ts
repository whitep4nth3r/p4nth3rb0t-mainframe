import { database } from "../../data/database";
import { PantherworldItem } from "../../data/entities/PantherworldItemEntity";
import { PantherworldPlayer } from "../../data/entities/PantherworldPlayerEntity";
import { FullTwitchUser } from "./../../data/types";
import UserManager from "../../users/UserManager";
import { MetaResponse, Population } from "./types";

export async function getMeta(): Promise<MetaResponse> {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const mostRecentUpdatedItem = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId IS NOT NULL")
    .andWhere("item.used = false")
    .andWhere("item.spoiled = false")
    .andWhere("item.cooked = false")
    .orderBy("item.updatedAt", "DESC")
    .select(["item.rarity", "item.name", "item.zone", "item.userId"])
    .getOne();

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

  const mostRecentCook = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId IS NOT NULL")
    .andWhere("item.cooked = true")
    .orderBy("item.updatedAt", "DESC")
    .select(["item.rarity", "item.name", "item.zone", "item.userId"])
    .getOne();

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

  const zoneCounts = await playerRepository
    .createQueryBuilder("player")
    .groupBy("player.zone")
    .select("player.zone", "_id")
    .addSelect("COUNT(player.id)", "count")
    .getRawMany();

  const population: Population = {};

  zoneCounts.forEach((zone) => {
    population[zone._id] = zone.count;
  });

  const recentItem = await itemRepository
    .createQueryBuilder("item")
    .orderBy("item.createdAt", "DESC")
    .getOne();

  const spawnedItems = await itemRepository
    .createQueryBuilder("item")
    .where("item.cooked IS NULL")
    .groupBy("item.name")
    .select("item.name", "_id")
    .addSelect("COUNT(item.id)", "count")
    .addSelect("item.rarity", "rarity")
    .orderBy("count", "DESC")
    .getRawMany();

  return {
    latestCook: latestCook,
    latestSpawned: {
      name: recentItem.name,
      zone: recentItem.zone,
      createdAt: recentItem.createdAt,
      rarity: recentItem.rarity,
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

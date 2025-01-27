import { database } from "../../../data/database";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import type { ItemForWealthIndex } from "../types";

export async function getAllItemsForPlayer(
  userId: string,
): Promise<ItemForWealthIndex[]> {
  const itemRepository = database.getRepository(PantherworldItem);

  const allItems = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId = :userId", { userId })
    .andWhere("item.used = false")
    .andWhere("item.spoiled = false")
    .groupBy("item.name")
    .select("item.name", "_id")
    .addSelect("COUNT(item.id)", "count")
    .addSelect("item.rarity", "rarity")
    .getRawMany();

  return allItems;
}

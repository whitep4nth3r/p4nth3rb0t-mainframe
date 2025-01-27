import { InventoryResponse } from "./types";
import { database } from "../../data/database";
import { PantherworldItem } from "../../data/entities/PantherworldItemEntity";
import { PantherworldPlayer } from "../../data/entities/PantherworldPlayerEntity";
import { getWealthIndex } from "../actions/wealth/wealthDistribution";

export async function getFullInventory(
  userId: string,
): Promise<InventoryResponse> {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const items = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId = :userId", { userId })
    .andWhere("item.used = false")
    .andWhere("item.spoiled = false")
    .groupBy("item.name")
    .select("item.name", "name")
    .addSelect("COUNT(item.id)", "count")
    .addSelect("item.rarity", "rarity")
    .addSelect("item.cooked", "cooked")
    .orderBy("rarity", "DESC")
    .getRawMany();

  let total = 0;

  items.forEach((item) => (total += item.count));

  const wealth_index = getWealthIndex(items);

  let locationString = "Not found";
  let spawnDateString = null;
  let playersInZone = 0;

  const player = await playerRepository.findOne({
    where: { id: userId },
  });

  if (player) {
    locationString = player.zone;
    spawnDateString = player.createdAt;

    const otherPlayers = await playerRepository.find({
      where: { zone: player.zone },
    });

    playersInZone = otherPlayers.length;
  }

  return {
    total,
    items,
    location: locationString,
    spawn_date: spawnDateString,
    players_in_zone: playersInZone,
    wealth_index,
  };
}

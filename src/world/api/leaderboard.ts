import { FullLeaderboardResponse, Player, ItemForWealthIndex } from "./types";
import { database } from "../../data/database";
import { PantherworldItem } from "../../data/entities/PantherworldItemEntity";
import { PantherworldPlayer } from "../../data/entities/PantherworldPlayerEntity";
import { getWealthIndex } from "../actions/wealth/wealthDistribution";

export function constructItemsForWealthIndexCalculation(
  items,
): ItemForWealthIndex[] {
  const itemsForWealthIndex: ItemForWealthIndex[] = [];

  for (let i = 0; i < items.length; i++) {
    const existingItem = itemsForWealthIndex.find(
      (item) => item._id === items[i].name,
    );

    if (existingItem) {
      existingItem.count += 1;
    } else {
      itemsForWealthIndex.push({
        _id: items[i].name,
        count: 1,
        rarity: items[i].rarity,
      });
    }
  }

  return itemsForWealthIndex;
}

function sortByWealthIndexDesc(a: Player, b: Player) {
  if (a.wealth_index > b.wealth_index) {
    return -1;
  }

  if (b.wealth_index > a.wealth_index) {
    return 1;
  }

  return 0;
}

export async function getFullLeaderboard(): Promise<FullLeaderboardResponse> {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const itemsGroupedByPlayer = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId IS NOT NULL")
    .andWhere("item.used = false")
    .andWhere("item.spoiled = false")
    .groupBy("item.userId")
    .select("item.userId", "_id")
    .addSelect("array_agg(item)", "items")
    .getRawMany();

  const leaderboardPlayers: Player[] = [];

  const allPlayerRecords = await playerRepository.findByIds(
    itemsGroupedByPlayer.map((player) => player._id),
  );

  for (const player of itemsGroupedByPlayer) {
    const itemsForWealthIndex = constructItemsForWealthIndexCalculation(
      player.items,
    );

    leaderboardPlayers.push({
      username: allPlayerRecords.find(
        (playerRecord) => playerRecord.userId === player._id,
      ).userDisplayName,
      items: player.items.length,
      wealth_index: getWealthIndex(itemsForWealthIndex),
    } as Player);
  }

  const sortedLeaderboard = leaderboardPlayers.sort(sortByWealthIndexDesc);

  return {
    players: sortedLeaderboard,
  };
}

import * as Sentry from "@sentry/node";
import { FullLeaderboardResponse, Player, ItemForWealthIndex } from "./types";
import PantherworldItemModel from "../../data/models/PantherworldItem";
import PantherworldPlayerModel, {
  PantherworldPlayerData,
} from "../../data/models/PantherworldPlayer";
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
  const itemsGroupedByPlayer = await PantherworldItemModel.aggregate([
    {
      $match: {
        userId: { $ne: null },
        used: { $ne: true },
        spoiled: { $ne: true },
      },
    },

    // Group documents by userId and push all items into an array
    { $group: { _id: "$userId", items: { $push: "$$ROOT" } } },
  ]);

  const leaderboardPlayers: Player[] = [];

  const promises = itemsGroupedByPlayer.map(async (player, index) => {
    const dbPlayer = (await PantherworldPlayerModel.findOne({
      userId: player._id,
    })) as PantherworldPlayerData;

    const itemsForWealthIndex = constructItemsForWealthIndexCalculation(
      player.items,
    );

    leaderboardPlayers.push({
      username: dbPlayer.userDisplayName,
      items: player.items.length,
      wealth_index: getWealthIndex(itemsForWealthIndex),
    } as Player);
  });

  await Promise.all(promises)
    .then()
    .catch((err) => {
      Sentry.captureException(err);
    });

  const sortedLeaderboard = leaderboardPlayers.sort(sortByWealthIndexDesc);

  return {
    players: sortedLeaderboard,
  };
}

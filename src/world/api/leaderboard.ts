import * as Sentry from "@sentry/node";
import { FullLeaderboardResponse, Player, ItemForWealthIndex } from "./types";
import PantherworldItemModel from "../../data/models/PantherworldItem";
import PantherworldPlayerModel, {
  PantherworldPlayerData,
} from "../../data/models/PantherworldPlayer";
import { getAllItemsForPlayerToCalculateWealthIndex } from "./player/allItems";
import { getWealthIndex } from "../actions/wealth/wealthDistribution";

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
  //  [{ _id: '1069819703', itemCount: 1 }]
  const players = await PantherworldItemModel.aggregate([
    {
      $match: {
        userId: { $ne: null },
        used: { $ne: true },
        spoiled: { $ne: true },
      },
    },

    // Group documents by userId, count the number of items in each group
    { $group: { _id: "$userId", itemCount: { $sum: 1 } } },
  ]);

  const leaderboardPlayers: Player[] = [];

  const promises = players.map(async (player) => {
    const allItems: ItemForWealthIndex[] =
      await getAllItemsForPlayerToCalculateWealthIndex(player._id);

    const dbPlayer = (await PantherworldPlayerModel.findOne({
      userId: player._id,
    })) as PantherworldPlayerData;

    leaderboardPlayers.push({
      username: dbPlayer.userDisplayName,
      items: player.itemCount,
      wealth_index: getWealthIndex(allItems),
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

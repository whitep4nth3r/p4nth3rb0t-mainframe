import * as Sentry from "@sentry/node";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import { sendPantherworldFeedEvent } from "../../../discord";
import UserManager from "../../../users/UserManager";
import { PantherworldEvent } from "../../api/types";

export async function getLeaderboard(): Promise<void> {
  const query = await PantherworldItemModel.aggregate([
    { $match: { userId: { $ne: null } } },

    // Group documents by userId, count the number of items in each group
    { $group: { _id: "$userId", itemCount: { $sum: 1 } } },

    // Sort the groups by itemCount in ascending order
    { $sort: { itemCount: -1 } },

    { $limit: 3 },
  ]);

  const leaderboardInfo = [];

  const promises = query.map(async (item, index) => {
    const emojis = ["🥇", "🥈", "🥉"];

    const user = await UserManager.getUserById(item._id);

    if (user) {
      leaderboardInfo[index] =
        `${emojis[index]} @${user.display_name} ${item.itemCount}`;
    } else {
      return null;
    }
  });

  Promise.all(promises)
    .then(async () => {
      const message = `${leaderboardInfo.join(", ")}`;

      tmi.say(config.channel, `${config.BOT_PREFIX}${message}`);
      
      await sendPantherworldFeedEvent(
        message,
        PantherworldEvent.LEADERBOARD,
        config.BOT_PREFIX,
      );
    })
    .catch((err) => {
      Sentry.captureException(err);
    });
}

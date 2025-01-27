import * as Sentry from "@sentry/node";
import { database } from "../../../data/database";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import { sendPantherworldFeedEvent } from "../../../discord";
import UserManager from "../../../users/UserManager";
import { PantherworldEvent } from "../../api/types";

export async function getLeaderboard(): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);

  const query = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId IS NOT NULL")
    .groupBy("item.userId")
    .select("item.userId", "_id")
    .addSelect("COUNT(item.id)", "itemCount")
    .orderBy("itemCount", "DESC")
    .limit(3)
    .getRawMany();

  const leaderboardInfo = [];

  const promises = query.map(async (item, index) => {
    const emojis = ["🥇", "🥈", "🥉"];

    const user = await UserManager.getUserById(item._id);

    if (user) {
      leaderboardInfo[
        index
      ] = `${emojis[index]} @${user.display_name} ${item.itemCount}`;
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

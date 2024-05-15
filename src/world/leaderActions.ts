import * as Sentry from "@sentry/node";
import PantherworldItemModel from "../data/models/PantherworldItem";
import { tmi } from "./../tmi";
import { config } from "../config";
import { sendPantherworldFeedEvent } from "../discord";
import { WorldState } from "./state";
import { getRandomEntry } from "../utils/getRandomEntry";
import { PantherworldZones } from "./zones";
import WebsocketServer from "../WebSocketServer";
import {
  MainframeEvent,
  ReleaseUnclaimedPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import UserManager from "../users/UserManager";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

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
      leaderboardInfo[
        index
      ] = `${emojis[index]} @${user.display_name} ${item.itemCount}`;
    } else {
      return null;
    }
  });

  Promise.all(promises)
    .then(async () => {
      const message = `${botPrefix}${leaderboardInfo.join(", ")}`;

      tmi.say(config.channel, message);
      await sendPantherworldFeedEvent(message);
    })
    .catch((err) => {
      Sentry.captureException(err);
    });
}

export async function releaseUnclaimed(): Promise<void> {
  const randomZone = getRandomEntry(PantherworldZones);

  const unclaimed = await PantherworldItemModel.aggregate([
    // Match documents with a null userId and random zone name
    { $match: { userId: null, zone: randomZone.name } },

    // Group documents by name, count the number of items in each group
    { $group: { _id: "$name", count: { $sum: 1 } } },

    // Sort the groups by count in descending order
    { $sort: { count: -1 } },
  ]);

  if (unclaimed.length === 0) {
    const message = `${botPrefix}🪹 There are no unclaimed items in the ${randomZone.name} zone!`;

    tmi.say(config.channel, message);
    await sendPantherworldFeedEvent(message);
  } else {
    WorldState.ITEMS_RELEASED = true;

    const itemList = unclaimed
      .map((item) => `${item.count} ${item._id}`)
      .join(", ");

    const message = `${botPrefix}📦 World items released in the ${randomZone.name} zone! Items available: ${itemList}`;

    tmi.say(config.channel, message);
    await sendPantherworldFeedEvent(message);

    const releaseUnclaimedEvent: ReleaseUnclaimedPacket = {
      event: MainframeEvent.releaseUnclaimed,
      id: randomZone.name + "-" + Date.now(),
      type: "release",
      data: {
        count: unclaimed.length,
        zone: randomZone.name,
      },
    };

    WebsocketServer.sendData(releaseUnclaimedEvent);

    setTimeout(async () => {
      WorldState.ITEMS_RELEASED = false;
      tmi.say(config.channel, `${botPrefix}🔒 All items locked!`);
      await sendPantherworldFeedEvent("🔒 All items locked!");
    }, 60000);
  }
}

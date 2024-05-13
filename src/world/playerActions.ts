import UserManager from "../users/UserManager";
import PantherworldPlayerModel from "../data/models/PantherworldPlayer";
import PantherworldItemModel from "../data/models/PantherworldItem";
import { tmi } from "./../tmi";
import { config } from "../config";
import * as Sentry from "@sentry/node";
import WebsocketServer from "../WebSocketServer";
import {
  MainframeEvent,
  PlayerMovePacket,
  PlayerClaimPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { sendPantherworldFeedEvent } from "../discord";
import { WorldState } from "./state";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

function capitalise(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

export async function listPopulation(): Promise<void> {
  const zoneCounts = await PantherworldPlayerModel.aggregate([
    { $group: { _id: "$zone", count: { $sum: 1 } } },
  ]);

  let total = 0;

  zoneCounts.forEach((zone) => (total += zone.count));

  const report = zoneCounts
    .map((zone) => `${capitalise(zone._id)} ${zone.count}`)
    .join(", ");

  const discordReport = zoneCounts
    .map((zone) => `${capitalise(zone._id)} **${zone.count}**`)
    .join(", ");

  tmi.say(
    config.channel,
    `${botPrefix}📊 Population: Total ${total}, ${report}`,
  );

  await sendPantherworldFeedEvent(
    `📊 Population: Total **${total}**,  ${discordReport}`,
  );
}

export async function locatePlayer(
  userId: string,
  displayName: string,
): Promise<void> {
  const entry = await PantherworldPlayerModel.findOne({
    userId: userId,
  });
  if (entry) {
    tmi.say(
      config.channel,
      `${botPrefix}📍 @${entry.userDisplayName}: you are in the ${entry.zone} zone`,
    );
  } else {
    tmi.say(
      config.channel,
      `${botPrefix}❌ @${displayName}: you are not in p4ntherworld... type !move {zoneName} to land`,
    );
  }
}

export async function movePlayer(userId: string, zone: string): Promise<void> {
  const user = await UserManager.getUserById(userId as string);

  if (user) {
    try {
      await PantherworldPlayerModel.updateOne(
        { userId: userId },
        {
          userId: userId,
          userDisplayName: user.display_name,
          zone: zone,
        },
        { upsert: true },
      );

      const message = `➡️ ${user.display_name} moved to ${zone} zone`;

      tmi.say(config.channel, `${botPrefix} ${message}`);

      await sendPantherworldFeedEvent(message);

      const playerMoveEvent: PlayerMovePacket = {
        event: MainframeEvent.playerMove,
        id: userId + "-" + Date.now(),
        type: "move",
        data: {
          username: user.display_name,
          toZone: zone,
        },
      };

      WebsocketServer.sendData(playerMoveEvent);
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}

export async function claimItem(
  name: string,
  userId: string,
  username: string,
): Promise<void> {
  let items;

  if (WorldState.ITEMS_RELEASED === false) {
    // if not in a !release state, get the items spawned a minute or less ago
    items = await PantherworldItemModel.find({
      name: name,
      createdAt: { $gt: new Date(Date.now() - 1000 * 60) },
    });
  } else {
    // if in a release state, get unclaimed items
    items = await PantherworldItemModel.find({
      name: name,
      userId: null,
    });
  }

  // where BUGS are actually features

  // currently items are stealable within the 1 minute time frame
  // technically, a claimable item should be where userID = null

  // in the future, when the item is being passed around, we could
  // announce that SOMEONE stole THING from SOMEONE

  const claimableItems = items.filter((item) => name === item.name);

  if (claimableItems.length === 0) {
    tmi.say(config.channel, `${botPrefix}❌ @${username}: Nothing to claim`);
  } else {
    const player = await PantherworldPlayerModel.findOne({ userId: userId });

    if (!player) {
      tmi.say(
        config.channel,
        `${botPrefix}❌ @${username}: you are not in p4ntherworld... type !move {zoneName} to land`,
      );
      return;
    }

    if (player) {
      const firstClaimableItem = claimableItems.find(
        (item) => item.zone === player.zone,
      );

      if (firstClaimableItem === undefined) {
        tmi.say(
          config.channel,
          `${botPrefix}❌ @${username}: You are in the wrong zone. !move to try and claim it!`,
        );
      } else {
        const updatedItem = await PantherworldItemModel.updateOne(
          {
            _id: firstClaimableItem._id,
          },
          {
            userId: userId,
          },
        );

        if (updatedItem.modifiedCount === 1) {
          const message = `${username} claimed ${name} in the ${player.zone} zone`;

          tmi.say(config.channel, `${botPrefix}🎒 @${message}`);

          await sendPantherworldFeedEvent(`🎒 ${message}`);

          const playerClaimEvent: PlayerClaimPacket = {
            event: MainframeEvent.playerClaim,
            id: userId + "-" + Date.now(),
            type: "claim",
            data: {
              username: username,
              zone: player.zone,
              item: name,
            },
          };

          WebsocketServer.sendData(playerClaimEvent);
        }
      }
    }
  }
}

export async function getInventory(
  userId: string,
  username: string,
): Promise<void> {
  const items = await PantherworldItemModel.aggregate([
    // Match documents with a specific userId
    { $match: { userId: userId } },

    // Group documents by name, count the number of items in each group
    { $group: { _id: "$name", count: { $sum: 1 } } },

    // Sort the groups by count in descending order
    { $sort: { count: -1 } },
  ]);

  let total = 0;

  items.forEach((item) => (total += item.count));

  const list = items.map((item) => `${item.count} ${item._id}`).join(", ");
  const itemString = list.length === 0 || list.length > 1 ? "items" : "item";

  tmi.say(
    config.channel,
    `${botPrefix}🎒 @${username}: you have ${total} ${itemString}${
      items.length > 0 ? ": " : ""
    } ${list}`,
  );
}

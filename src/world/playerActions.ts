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
import { sendPantherworldEvent } from "../discord";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

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
      `${botPrefix}❌ @${displayName}: you are not in p4ntherw0rld... yet`,
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

      await sendPantherworldEvent(message);

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
  const recentItems = await PantherworldItemModel.find({
    name: name,
    createdAt: { $gt: new Date(Date.now() - 1000 * 60) },
  });

  // where BUGS are actually features

  // currently items are stealable within the 1 minute time frame
  // technically, a claimable item should be where userID = null

  // in the future, when the item is being passed around, we could
  // announce that SOMEONE stole THING from SOMEONE

  const claimableItems = recentItems.filter((item) => name === item.name);

  if (claimableItems.length === 0) {
    tmi.say(config.channel, `${botPrefix}❌ @${username}: Nothing to claim`);
  } else {
    const player = await PantherworldPlayerModel.findOne({ userId: userId });

    if (!player) {
      tmi.say(
        config.channel,
        `${botPrefix}❌ @${username}: you are not in p4ntherw0rld... yet`,
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
          `${botPrefix}❌ @${username}: You are in the wrong zone. Move to try and claim it!`,
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

          await sendPantherworldEvent(`🎒 ${message}`);

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
        } else {
          tmi.say(
            config.channel,
            `${botPrefix}❌ @${username}: Nothing has been claimed`,
          );
        }
      }
    }
  }
}

export async function getInventory(
  userId: string,
  username: string,
): Promise<void> {
  const items = await PantherworldItemModel.find({ userId: userId }).exec();
  const list: { [key: string]: number } = {};

  items.forEach((item) => {
    // if list doesn't have a key of item.name
    // add key to list with value 1
    if (!Object.keys(list).includes(item.name)) {
      list[item.name] = 1;
    } else {
      list[item.name] += 1;
    }
  });

  const listStringArray = [];

  for (const [key, value] of Object.entries(list)) {
    listStringArray.push(`${value} ${key}`);
  }

  const itemString =
    listStringArray.length === 0 || listStringArray.length > 1
      ? "items"
      : "item";

  tmi.say(
    config.channel,
    `${botPrefix}🎒 @${username}: you have ${items.length} ${itemString}${
      listStringArray.length > 0 ? ": " : ""
    } ${listStringArray.join(", ")}`,
  );
}

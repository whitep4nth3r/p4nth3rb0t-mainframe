import UserManager from "../users/UserManager";
import PantherworldPlayerModel from "../data/models/PantherworldPlayer";
import PantherworldItemModel from "../data/models/PantherworldItem";
import { tmi } from "./../tmi";
import { config } from "../config";
import * as Sentry from "@sentry/node";

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

      tmi.say(
        config.channel,
        `${botPrefix}➡️ ${user.display_name} moved to ${zone} zone`,
      );
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

  const claimableItems = recentItems.filter((item) => name === item.name);

  if (claimableItems.length === 0) {
    tmi.say(config.channel, `❌ @${username}: Nothing to claim`);
  } else {
    const player = await PantherworldPlayerModel.findOne({ userId: userId });

    if (player) {
      const firstClaimableItem = claimableItems.find(
        (item) => item.zone === player.zone,
      );

      if (firstClaimableItem === undefined) {
        tmi.say(
          config.channel,
          `❌ @${username}: You are in the wrong zone. Move to try and claim it!`,
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
          tmi.say(
            config.channel,
            `🎒 @${username} claimed ${name} in the ${player.zone} zone`,
          );
        } else {
          tmi.say(config.channel, `❌ @${username}: Nothing has been claimed`);
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

  //todo - group items and count

  tmi.say(
    config.channel,
    `🎒 @${username}: you have ${items.length} items. You'll find out what next time.`,
  );
}

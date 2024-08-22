import PantherworldPlayerModel, {
  PantherworldPlayerDoc,
} from "../../../data/models/PantherworldPlayer";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import UserManager from "../../../users/UserManager";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import * as Sentry from "@sentry/node";
import WebsocketServer from "../../../WebSocketServer";
import {
  MainframeEvent,
  PlayerMovePacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { sendPantherworldFeedEvent } from "../../../discord";
import { PantherworldEvent } from "../../api/types";
import { spawn, SpawnEventType } from "../../spawn";
// import { releaseUnclaimed } from "../leader/releaseUnclaimed";
import { PantherworldZones } from "../../zones";

const ITEMS_PER_MS = 250;

async function runSpawnCheck(userDisplayName: string): Promise<void> {
  // 15% chance of spawning an item
  const willSpawn = Math.random() > 0.85;

  if (willSpawn) {
    await spawn({
      type: SpawnEventType.Move,
      data: { username: userDisplayName },
    });
  }
}

async function sendWebsocketEvent(
  userId: string,
  userDisplayName: string,
  moveToZone: string,
): Promise<void> {
  const playerMoveEvent: PlayerMovePacket = {
    event: MainframeEvent.playerMove,
    id: userId + "-" + Date.now(),
    type: "move",
    data: {
      username: userDisplayName,
      toZone: moveToZone,
    },
  };

  WebsocketServer.sendData(playerMoveEvent);
}

async function announceMove(
  displayName: string,
  moveToZone: string,
  delayInMs?: number,
): Promise<void> {
  const delayString = delayInMs !== undefined ? ` in ${delayInMs}ms` : "";
  const message = `${displayName} moved to ${moveToZone} zone${delayString}`;

  tmi.say(config.channel, `${config.BOT_PREFIX}➡️ ${message}`);

  await sendPantherworldFeedEvent(
    message,
    PantherworldEvent.MOVE,
    config.BOT_PREFIX,
  );
}

export function canMoveFromCurrentZoneToDesiredZone(
  currentZone: string,
  desiredZone: string,
): boolean {
  const nearbyZones = PantherworldZones.find(
    (zone) => zone.name === currentZone,
  ).nearbyZones;

  return nearbyZones.includes(desiredZone);
}

async function dealWithExistingPlayer(
  player: PantherworldPlayerDoc,
  moveToZone: string,
): Promise<void> {
  const canMove = canMoveFromCurrentZoneToDesiredZone(player.zone, moveToZone);

  if (canMove === false) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}❌ @${player.userDisplayName} cannot move from ${player.zone} zone to ${moveToZone} zone!`,
    );

    return;
  }

  // we movin'
  const allItems = await PantherworldItemModel.aggregate([
    {
      $match: {
        userId: player.userId,
        used: { $ne: true },
        spoiled: { $ne: true },
      },
    },
    { $count: "total" },
  ]);

  const itemCount = allItems.length > 0 ? allItems[0].total : 0;
  const delayInMs = (itemCount / ITEMS_PER_MS) * 1000;

  setTimeout(async () => {
    await PantherworldPlayerModel.findOneAndUpdate(
      { userId: player.userId },
      {
        zone: moveToZone,
      },
      { returnDocument: "after" },
    );

    await announceMove(player.userDisplayName, moveToZone, delayInMs);
    await sendWebsocketEvent(player.userId, player.userDisplayName, moveToZone);
    await runSpawnCheck(player.userDisplayName);
  }, delayInMs);
}

async function dealWithNewPlayer(
  userId: string,
  moveToZone: string,
  announceToChat: boolean = true,
): Promise<void> {
  const user = await UserManager.getUserById(userId as string);

  if (user) {
    try {
      const created = new Date();
      const newPlayerInsert: any =
        (await PantherworldPlayerModel.findOneAndUpdate(
          { userId: userId },
          {
            userId: userId,
            userDisplayName: user.display_name,
            zone: moveToZone,
            createdAt: created,
          },
          { upsert: true, returnDocument: "after" },
        )) as PantherworldPlayerDoc | null;

      if (newPlayerInsert !== null) {
        if (announceToChat === true) {
          await announceMove(newPlayerInsert.userDisplayName, moveToZone);
        }

        await sendWebsocketEvent(
          newPlayerInsert.userId,
          newPlayerInsert.userDisplayName,
          moveToZone,
        );

        await runSpawnCheck(newPlayerInsert.userDisplayName);
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}

export async function movePlayer(
  userId: string,
  moveToZone: string,
  announceToChat: boolean = true,
): Promise<void> {
  const playerFind = await PantherworldPlayerModel.findOne({
    userId: userId,
  });

  if (playerFind !== null) {
    await dealWithExistingPlayer(playerFind, moveToZone);
    return;
  }

  await dealWithNewPlayer(userId, moveToZone, announceToChat);
}

import { database } from "../../../data/database";
import { PantherworldPlayer } from "../../../data/entities/PantherworldPlayerEntity";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import UserManager from "../../../users/UserManager";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import * as Sentry from "@sentry/node";
import WebsocketServer from "../../../classes/WebSocketServer";
import {
  MainframeEvent,
  PlayerMovePacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { sendPantherworldFeedEvent } from "../../../discord";
import { PantherworldEvent } from "../../api/types";
import { spawn, SpawnEventType } from "../../spawn";
import { releaseUnclaimed } from "../leader/releaseUnclaimed";
import { PantherworldZones } from "../../zones";

const ITEMS_PER_MS = 250;

async function runSpawnAndReleaseCheck(
  userDisplayName: string,
  moveToZone: string,
): Promise<void> {
  const willSpawn = Math.random() > 0.85;

  if (willSpawn) {
    await spawn({
      type: SpawnEventType.Move,
      data: { username: userDisplayName },
    });
  } else {
    const willRelease = Math.random() > 0.85;

    if (willRelease) {
      await releaseUnclaimed(moveToZone);
    }
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
  player: PantherworldPlayer,
  moveToZone: string,
): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const canMove = canMoveFromCurrentZoneToDesiredZone(player.zone, moveToZone);

  if (canMove === false) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}❌ @${player.userDisplayName} cannot move from ${player.zone} zone to ${moveToZone} zone!`,
    );

    return;
  }

  const allItems = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId = :userId", { userId: player.userId })
    .andWhere("item.used = false")
    .andWhere("item.spoiled = false")
    .getCount();

  const itemCount = allItems;
  const delayInMs = (itemCount / ITEMS_PER_MS) * 1000;

  setTimeout(async () => {
    player.zone = moveToZone;
    await playerRepository.save(player);

    await announceMove(player.userDisplayName, moveToZone, delayInMs);
    await sendWebsocketEvent(player.userId, player.userDisplayName, moveToZone);
    await runSpawnAndReleaseCheck(player.userDisplayName, moveToZone);
  }, delayInMs);
}

async function dealWithNewPlayer(
  userId: string,
  moveToZone: string,
  announceToChat: boolean = true,
): Promise<void> {
  const playerRepository = database.getRepository(PantherworldPlayer);

  const user = await UserManager.getUserById(userId as string);

  if (user) {
    try {
      const newPlayer = playerRepository.create({
        userId: userId,
        userDisplayName: user.display_name,
        zone: moveToZone,
      });

      const newPlayerInsert = await playerRepository.save(newPlayer);

      if (newPlayerInsert) {
        if (announceToChat === true) {
          await announceMove(newPlayerInsert.userDisplayName, moveToZone);
        }

        await sendWebsocketEvent(
          newPlayerInsert.userId,
          newPlayerInsert.userDisplayName,
          moveToZone,
        );

        await runSpawnAndReleaseCheck(
          newPlayerInsert.userDisplayName,
          moveToZone,
        );
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
  const playerRepository = database.getRepository(PantherworldPlayer);

  const playerFind = await playerRepository.findOne({
    where: { userId: userId },
  });

  if (playerFind !== null) {
    await dealWithExistingPlayer(playerFind, moveToZone);
    return;
  }

  await dealWithNewPlayer(userId, moveToZone, announceToChat);
}

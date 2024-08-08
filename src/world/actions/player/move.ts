import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
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
import { releaseUnclaimed } from "../leader/releaseUnclaimed";

export async function movePlayer(
  userId: string,
  zone: string,
  announceToChat: boolean = true,
): Promise<void> {
  const user = await UserManager.getUserById(userId as string);

  if (user) {
    try {
      const created = new Date();

      await PantherworldPlayerModel.updateOne(
        { userId: userId },
        {
          userId: userId,
          userDisplayName: user.display_name,
          zone: zone,
          createdAt: created,
        },
        { upsert: true },
      );

      if (announceToChat) {
        const message = `${user.display_name} moved to ${zone} zone`;

        tmi.say(config.channel, `${config.BOT_PREFIX}➡️ ${message}`);

        await sendPantherworldFeedEvent(
          message,
          PantherworldEvent.MOVE,
          config.BOT_PREFIX,
        );
      }

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

      // 15% chance of spawning an item
      const willSpawn = Math.random() > 1;

      if (willSpawn) {
        await spawn({
          type: SpawnEventType.Move,
          data: { username: user.display_name },
        });
      } else {
        // if no spawn, 15% probability of release
        const willRelease = Math.random() > 0.85;

        if (willRelease) {
          await releaseUnclaimed(zone);
        }
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}

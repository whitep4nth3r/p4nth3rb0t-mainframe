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

export async function movePlayer(
  userId: string,
  zone: string,
  announceToChat: boolean = true,
): Promise<void> {
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

      if (announceToChat) {
        const message = `${config.BOT_PREFIX}➡️ ${user.display_name} moved to ${zone} zone`;
        tmi.say(config.channel, message);
        await sendPantherworldFeedEvent(message);
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
    } catch (error) {
      Sentry.captureException(error);
    }
  }
}

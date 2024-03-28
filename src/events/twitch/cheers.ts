import * as Sentry from "@sentry/node";
import { tmi } from "../../tmi";
import WebSocketServer from "../../WebSocketServer";
import { ChatUserstate } from "tmi.js";
import UserManager from "../../users/UserManager";
import { CheerPacket, MainframeEvent } from "@whitep4nth3r/p4nth3rb0t-types";
import Moods, { sendMoodChangeEvent } from "./moods";
import { config } from "../../config";
import { SpawnEventType, spawn } from "../../world/spawn";

const sendCheerEvent = async (
  bitCount: string,
  messageId: string,
  username: string,
) => {
  const user = await UserManager.getUserByLogin(username);

  if (user) {
    try {
      const cheerEvent: CheerPacket = {
        event: MainframeEvent.cheer,
        id: messageId,
        data: {
          bitCount: bitCount,
          cheererName: username,
          logoUrl: user.profile_image_url,
        },
      };

      WebSocketServer.sendData(cheerEvent);

      setTimeout(async () => {
        const newRandomMood: string = Moods.getRandomNewMood();
        await sendMoodChangeEvent(newRandomMood, Date.now().toString());
      }, 3500);
    } catch (error) {
      Sentry.captureException(error);
    }
  }
};

tmi.on("cheer", (channel: string, userstate: ChatUserstate) => {
  if (!config.FREEZE_MODE) {
    spawn({
      type: SpawnEventType.Cheer,
      data: { bits: Number(userstate["bits"]) },
    });

    sendCheerEvent(
      userstate["bits"] as string,
      userstate["id"] as string,
      userstate["username"] as string,
    );
  }
});

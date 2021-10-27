import { tmi } from "../tmi";
import WebSocketServer from "../WebSocketServer";
import { ChatUserstate } from "tmi.js";
import UserManager from "../users/UserManager";
import { CheerPacket, MainframeEvent } from "@whitep4nth3r/p4nth3rb0t-types";
import Moods, { sendMoodChangeEvent } from "./moods";
import { config } from "../config";

const sendCheerEvent = async (
  bitCount: string,
  messageId: string,
  username: string,
) => {
  const userResponse = await UserManager.getUserByLogin(username);

  if (userResponse) {
    try {
      const cheerEvent: CheerPacket = {
        event: MainframeEvent.cheer,
        id: messageId,
        data: {
          bitCount: bitCount,
          cheererName: username,
          logoUrl: userResponse.data[0].profile_image_url,
        },
      };

      WebSocketServer.sendData(cheerEvent);

      setTimeout(async () => {
        const newRandomMood: string = Moods.getRandomNewMood();
        await sendMoodChangeEvent(newRandomMood, Date.now().toString());
      }, 3500);
    } catch (error) {
      console.log(error);
    }
  }
};

tmi.on(
  "cheer",
  (channel: string, userstate: ChatUserstate, message: string) => {
    if (!config.FREEZE_MODE) {
      sendCheerEvent(
        userstate["bits"] as string,
        userstate["id"] as string,
        userstate["username"] as string,
      );
    }
  },
);

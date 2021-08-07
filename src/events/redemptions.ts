import { tmi } from "../tmi";
import { ChatUserstate } from "tmi.js";
import { config } from "../config";
import { sendMoodChangeEvent } from "./moods";
import {
  NumeronymPacket,
  MainframeEvent,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";

export const sendNumeronymEvent = async (isActive: boolean) => {
  try {
    const numeronymEvent: NumeronymPacket = {
      event: MainframeEvent.numeronym,
      id: Math.random().toString(),
      data: {
        isActive,
      },
    };

    WebSocketServer.sendData(numeronymEvent);
  } catch (error) {
    console.log(error);
  }
};

tmi.on(
  "message",
  async (
    channel: string,
    tags: ChatUserstate,
    message: string,
    self: boolean,
  ) => {
    const rewardId: string = tags["custom-reward-id"];

    if (Object.keys(config.channelRedemptions).includes(rewardId)) {
      switch (config.channelRedemptions[rewardId]) {
        case "numeronym":
          sendNumeronymEvent(true);

          setTimeout(async () => {
            sendNumeronymEvent(false);
          }, 300000);
        default:
          return null;
      }
    }

    if (Object.keys(config.moodRedemptions).includes(rewardId)) {
      const mood: string = config.moodRedemptions[rewardId];
      const username: string = tags["username"] as string;

      await sendMoodChangeEvent(mood, rewardId);

      tmi.say(
        config.channel,
        `whitep30PEWPEW @${username} redeemed ${mood} panther! whitep30PEWPEW`,
      );
    }
  },
);

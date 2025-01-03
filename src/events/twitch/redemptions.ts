import { createTechHelpThread } from "./../../discord";
import * as Sentry from "@sentry/node";
import { tmi } from "../../tmi";
import { ChatUserstate } from "tmi.js";
import { config } from "../../config";
import { sendMoodChangeEvent } from "./moods";
import UserManager from "../../users/UserManager";
import {
  NumeronymPacket,
  MainframeEvent,
  FirstPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../../classes/WebSocketServer";
// import { MoodEmotes } from "../../data/types";

const sendNumeronymEvent = async (isActive: boolean) => {
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
    Sentry.captureException(error);
  }
};

const sendFirstEvent = async (username: string, message: string) => {
  try {
    const user = await UserManager.getUserByLogin(username);

    if (user) {
      const firstEvent: FirstPacket = {
        event: MainframeEvent.first,
        id: Math.random().toString(),
        data: {
          username,
          logoUrl: user.profile_image_url,
          message,
        },
      };

      WebSocketServer.sendData(firstEvent);
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};

// const MoodEmotesForChatResponse: MoodEmotes = {
//   coffee: "p4nth3rUP",
//   cool: "p4nth3rCOOL",
//   dolla: "p4nth3rUP",
//   fire: "p4nth3rFIRE",
//   heart: "p4nth3rLOVE",
//   hype: "p4nth3rHYPE",
//   majick: "p4nth3rMAGIC",
//   pewpew: "p4nth3rPEWPEW",
//   rap: "p4nth3rUP",
//   sad: "p4nth3rSAD",
//   scam: "p4nth3rSCAM",
//   star: "p4nth3rSTAR",
//   tattoo: "p4nth3rUP",
//   troll: "p4nth3rTROLL",
// };

tmi.on(
  "message",
  async (channel: string, tags: ChatUserstate, message: string) => {
    const rewardId: string = tags["custom-reward-id"];

    if (!config.FREEZE_MODE) {
      if (Object.keys(config.channelRedemptions).includes(rewardId)) {
        const rewardName = config.channelRedemptions[rewardId];

        switch (rewardName) {
          case "numeronym":
            await sendNumeronymEvent(true);

            setTimeout(async () => {
              await sendNumeronymEvent(false);
            }, 300000);
            break;
          case "first":
            await sendFirstEvent(tags["username"] as string, message);
            break;
          case "tts-to-discord":
            await createTechHelpThread(tags["username"] as string, message);
            break;
          default:
            return null;
        }
      }

      if (Object.keys(config.moodRedemptions).includes(rewardId)) {
        const mood: string = config.moodRedemptions[rewardId];

        await sendMoodChangeEvent(mood, rewardId);
      }
    }
  },
);

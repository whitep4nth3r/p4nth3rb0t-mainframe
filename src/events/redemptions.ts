import { tmi } from "../tmi";
import { ChatUserstate } from "tmi.js";
import { config } from "../config";
import { sendMoodChangeEvent } from "./moods";

tmi.on(
  "message",
  async (
    channel: string,
    tags: ChatUserstate,
    message: string,
    self: boolean,
  ) => {
    const rewardId: string = tags["custom-reward-id"];

    if (Object.keys(config.redemptions).includes(rewardId)) {
      const mood: string = config.redemptions[rewardId];
      const username: string = tags["username"] as string;

      await sendMoodChangeEvent(mood, rewardId);

      tmi.say(
        config.channel,
        `whitep30PEWPEW @${username} redeemed ${mood} panther! whitep30PEWPEW`,
      );
    }
  },
);

import { config } from "../config";
import { ChatUserstate } from "tmi.js";
import { sendShoutoutEvent } from "../events/shoutout";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getCommandFromMessage = (message: string) => message.split(" ")[0];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const getRestOfMessage = (message: string) =>
  message.split(" ").slice(1);

type Handler = (tags: ChatUserstate, message: string) => void;

type Commands = {
  [key: string]: Handler;
};

export const ExclusiveCommands: Commands = {};

export const BroadcasterCommands: Commands = {
  "!so": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      await sendShoutoutEvent(tags["id"] as string, message);
    }
  },
};

export const ChatCommands: Commands = {
  /*"!yeet": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      const userToYeet = getRestOfMessage(message);

      if (userToYeet[0] === "me" && tags["display-name"]) {
        await sendYeetEvent(tags["display-name"], tags["id"] as string);
      } else if (userToYeet.length === 1) {
        await sendYeetEvent(userToYeet[0].replace("@", ""), tags["id"] as string);
      }
    }
  },*/
};

import { tmi } from "./../tmi";
import { config } from "../config";
import {
  sendDropEmotesEvent,
  sendDropUserEvent,
  sendWeatherEvent,
  sendWeatherTrailEvent,
  sendYeetEvent,
  sendImageDropEvent,
} from "../actions/drop";
import { ChatUserstate } from "tmi.js";
import { sendShoutoutEvent } from "../events/twitch/shoutout";
import { sendRaidEvent } from "../events/twitch/raids_outgoing";
import Giveaway from "../actions/Giveaway";
import { ImageDrops, TwitchAnnouncementColor } from "../data/types";
import { sendMerchEvent } from "../events/twitch/merch";
import {
  sendBackseatEvent,
  sendClearBackSeatEvent,
} from "../events/twitch/backseat";
import { sendFreezeEvent } from "../events/twitch/freeze";
import { sendTheClawEvent } from "../events/twitch/theclaw";
import { megaTimeOut } from "../events/twitch/megatimeout";
import { announce } from "./twitchUtils";
import { WorldCommands, WorldLeaderCommands } from "../world/commands";

export const getCommandFromMessage = (message: string) => message.split(" ")[0];

export const getRestOfMessage = (message: string): string[] =>
  message.split(" ").slice(1);

type Handler = (tags: ChatUserstate, message: string) => void;

type Commands = {
  [key: string]: Handler;
};

export const ExclusiveCommands: Commands = {
  "!megatimeout": async () => {
    await megaTimeOut();
  },
  "!raid": async (tags, message) => {
    await sendRaidEvent(tags["id"] as string, message);
  },
  ...WorldLeaderCommands,
};

export const BroadcasterCommands: Commands = {
  "!freeze": async () => {
    await announce("p4nth3rRAID [DEFENCES UP] p4nth3rRAID");
    // toggle FREEZE_MODE
    config.FREEZE_MODE = true;
    // clear chat
    await tmi.say(config.channel, "/clear");
    // activate sub only
    await tmi.say(config.channel, "/subscribers");
    await sendClearBackSeatEvent();
    await sendFreezeEvent();
  },
  "!unfreeze": async () => {
    await announce("p4nth3rMAGIC [DEFENCES DOWN] p4nth3rMAGIC");
    // toggle FREEZE_MODE
    config.FREEZE_MODE = false;
    // deactivate sub only
    await tmi.say(config.channel, "/subscribersoff");
  },
  "!start-trail": async () => {
    if (!config.FREEZE_MODE) {
      await sendWeatherTrailEvent(true);
    }
  },
  "!end-trail": async () => {
    if (!config.FREEZE_MODE) {
      await sendWeatherTrailEvent(false);
    }
  },
  "!so": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      await sendShoutoutEvent(tags["id"] as string, message);
    }
  },
  "!merch": async (tags) => {
    if (!config.FREEZE_MODE) {
      await sendMerchEvent(tags["id"] as string);
    }
  },
  "!theclaw": async () => {
    if (!config.FREEZE_MODE) {
      await sendTheClawEvent();
    }
  },
};

export const ChatCommands: Commands = {
  "!raidcall": async () => {
    if (!config.FREEZE_MODE) {
      await tmi.say(
        config.channel,
        "p4nth3rRAID p4nth3rHYPE p4nth3rUP PANTHER RAID!!! p4nth3rRAID p4nth3rHYPE p4nth3rUP PANTHER RAID!!! p4nth3rRAID p4nth3rHYPE p4nth3rUP PANTHER RAID!!! p4nth3rRAID p4nth3rHYPE p4nth3rUP PANTHER RAID!!! p4nth3rRAID p4nth3rHYPE p4nth3rUP PANTHER RAID!!! p4nth3rRAID p4nth3rHYPE p4nth3rUP PANTHER RAID!!! p4nth3rRAID p4nth3rHYPE p4nth3rUP",
      );
    }
  },
  "!nobs": async () => {
    await sendClearBackSeatEvent();
  },
  "!bs": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      const username = getRestOfMessage(message)[0];
      if (username !== undefined) {
        await sendBackseatEvent(username.replace("@", "").toLowerCase());
      }
    }
  },
  "!win": async (tags) => {
    if (!config.FREEZE_MODE) {
      if (Giveaway.inProgress()) {
        Giveaway.enter(tags.username as string);
      } else {
        await tmi.say(config.channel, Giveaway.getInactiveMessage());
      }
    }
  },
  "!bigdrop": async (tags) => {
    if (tags.emotes && !config.FREEZE_MODE) {
      sendDropEmotesEvent(
        Object.keys(tags.emotes) as [],
        true,
        tags["id"] as string,
        "!bigdrop",
      );
    }
  },
  "!drop": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      if (tags.emotes) {
        sendDropEmotesEvent(
          Object.keys(tags.emotes) as [],
          false,
          tags["id"] as string,
          "!drop",
        );
      }

      if (getRestOfMessage(message)[0] === "me") {
        await sendDropUserEvent(tags["user-id"] as string, tags["id"] as string);
      }
    }
  },
  "!rain": async (tags) => {
    if (!config.FREEZE_MODE) {
      sendWeatherEvent("!rain", tags["id"] as string);
    }
  },
  "!shower": async (tags) => {
    if (!config.FREEZE_MODE) {
      sendWeatherEvent("!shower", tags["id"] as string);
    }
  },
  "!snow": async (tags) => {
    if (!config.FREEZE_MODE) {
      sendWeatherEvent("!snow", tags["id"] as string);
    }
  },
  "!hail": async (tags) => {
    if (!config.FREEZE_MODE) {
      sendWeatherEvent("!hail", tags["id"] as string);
    }
  },
  "!blizzard": async (tags) => {
    if (!config.FREEZE_MODE) {
      sendWeatherEvent("!blizzard", tags["id"] as string);
    }
  },
  "!fire": async (tags) => {
    if (!config.FREEZE_MODE) {
      sendWeatherEvent("!fire", tags["id"] as string);
    }
  },
  "!yeet": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      const userToYeet = getRestOfMessage(message);

      if (userToYeet[0] === "me" && tags["display-name"]) {
        await sendYeetEvent(tags["display-name"], tags["id"] as string);
      } else if (userToYeet.length === 1) {
        await sendYeetEvent(userToYeet[0].replace("@", ""), tags["id"] as string);
      }
    }
  },
  "!checkmark": async (tags) => {
    if (!config.FREEZE_MODE) {
      await sendImageDropEvent(ImageDrops.Partner, tags["id"] as string);
    }
  },
  "!spooky": async (tags) => {
    if (!config.FREEZE_MODE) {
      await sendImageDropEvent(ImageDrops.Spooky, tags["id"] as string);
    }
  },
  "!theclaw": async (tags) => {
    if (!config.FREEZE_MODE) {
      await announce(
        "p4nth3rMOTH p4nth3rMOTH p4nth3rMOTH Check out The Claw Stream Team! https://theclaw.team p4nth3rMOTH p4nth3rMOTH p4nth3rMOTH",
        TwitchAnnouncementColor.Purple,
      );
      await sendImageDropEvent(ImageDrops.TheClaw, tags["id"] as string);
    }
  },
  ...WorldCommands,
};

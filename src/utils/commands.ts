import { tmi } from "./../tmi";
import { sendDropEmotesEvent } from "./../actions/drop";
import { ChatUserstate } from "tmi.js";
import { config } from "../config";
import {
  sendDropUserEvent,
  sendWeatherEvent,
  sendWeatherTrailEvent,
  sendYeetEvent,
  sendImageDropEvent,
} from "../actions/drop";
import { sendMoodChangeEvent } from "../events/moods";
import { sendShoutoutEvent } from "../events/shoutout";
import Giveaway from "../actions/Giveaway";
import { ImageDrops } from "../data/types";
import { sendMerchEvent } from "../events/merch";
import { sendBackseatEvent, sendClearBackSeatEvent } from "../events/backseat";

export const getCommandFromMessage = (message: string) => message.split(" ")[0];

export const getRestOfMessage = (message: string) =>
  message.split(" ").slice(1);

type Handler = (tags: ChatUserstate, message: string) => void;

type Commands = {
  [key: string]: Handler;
};

export const ExclusiveCommands: Commands = {};

export const BroadcasterCommands: Commands = {
  "!coffee": async (tags, message) => {
    sendMoodChangeEvent("coffee", tags["id"] as string);
  },
  "!cool": async (tags, message) => {
    sendMoodChangeEvent("cool", tags["id"] as string);
  },
  "!dolla": async (tags, message) => {
    sendMoodChangeEvent("dolla", tags["id"] as string);
  },
  "!fire": async (tags, message) => {
    sendMoodChangeEvent("fire", tags["id"] as string);
  },
  "!heart": async (tags, message) => {
    sendMoodChangeEvent("heart", tags["id"] as string);
  },
  "!majick": async (tags, message) => {
    sendMoodChangeEvent("majick", tags["id"] as string);
  },
  "!pewpew": async (tags, message) => {
    sendMoodChangeEvent("pewpew", tags["id"] as string);
  },
  "!rap": async (tags, message) => {
    sendMoodChangeEvent("rap", tags["id"] as string);
  },
  "!sad": async (tags, message) => {
    sendMoodChangeEvent("sad", tags["id"] as string);
  },
  "!so": async (tags, message) => {
    sendShoutoutEvent(tags["id"] as string, message);
  },
  "!star": async (tags, message) => {
    sendMoodChangeEvent("star", tags["id"] as string);
  },
  "!tattoo": async (tags, message) => {
    sendMoodChangeEvent("tattoo", tags["id"] as string);
  },
  "!troll": async (tags, message) => {
    sendMoodChangeEvent("troll", tags["id"] as string);
  },
  "!merch": async (tags, message) => {
    sendMerchEvent(tags["id"] as string);
  },
};

export const ChatCommands: Commands = {
  "!nobs": async (tags, message) => {
    sendClearBackSeatEvent();
  },
  "!bs": async (tags, message) => {
    const username = getRestOfMessage(message)[0].replace("@", "");
    sendBackseatEvent(username);
  },
  "!win": async (tags, message) => {
    if (Giveaway.inProgress()) {
      Giveaway.enter(tags.username as string);
    } else {
      tmi.say(config.channel, Giveaway.getInactiveMessage());
    }
  },
  "!start-trail": async (tags, message) => {
    if (tags.username === config.broadcaster.name) {
      sendWeatherTrailEvent(true);
    }
  },
  "!end-trail": async (tags, message) => {
    if (tags.username === config.broadcaster.name) {
      sendWeatherTrailEvent(false);
    }
  },
  "!bigdrop": async (tags, message) => {
    if (tags.emotes) {
      sendDropEmotesEvent(
        Object.keys(tags.emotes) as [],
        true,
        tags["id"] as string,
        "!bigdrop",
      );
    }
  },
  "!drop": async (tags, message) => {
    if (tags.emotes) {
      sendDropEmotesEvent(
        Object.keys(tags.emotes) as [],
        false,
        tags["id"] as string,
        "!drop",
      );
    }

    // !drop me
    // TODO - only do user drop if this-
    // if (Date.now() - new Date(user.created_at) >= config.minAccountAge) {}

    if (getRestOfMessage(message)[0] === "me") {
      sendDropUserEvent(tags["user-id"] as string, tags["id"] as string);
    }
  },
  "!rain": async (tags, message) => {
    sendWeatherEvent("!rain", tags["id"] as string);
  },
  "!shower": async (tags, message) => {
    sendWeatherEvent("!shower", tags["id"] as string);
  },
  "!snow": async (tags, message) => {
    sendWeatherEvent("!snow", tags["id"] as string);
  },
  "!hail": async (tags, message) => {
    sendWeatherEvent("!hail", tags["id"] as string);
  },
  "!blizzard": async (tags, message) => {
    sendWeatherEvent("!blizzard", tags["id"] as string);
  },
  "!fire": async (tags, message) => {
    sendWeatherEvent("!fire", tags["id"] as string);
  },
  "!yeet": async (tags, message) => {
    const userToYeet = getRestOfMessage(message);

    if (userToYeet[0] === "me" && tags["display-name"]) {
      sendYeetEvent(tags["display-name"], tags["id"] as string);
    } else if (userToYeet.length === 1) {
      sendYeetEvent(userToYeet[0].replace("@", ""), tags["id"] as string);
    }
  },
  "!content": async (tags, message) => {
    tmi.say(
      config.channel,
      "Salma works in Developer Relations for Contentful. Find out more about Contentful at the Developer Portal: https://www.contentful.com/developers/",
    );
    sendImageDropEvent(ImageDrops.Contentful, tags["id"] as string);
  },
  "!checkmark": async (tags, message) => {
    sendImageDropEvent(ImageDrops.Partner, tags["id"] as string);
  },
  "!battlesnake": async (tags, message) => {
    sendImageDropEvent(ImageDrops.Battlesnake, tags["id"] as string);
  },
};

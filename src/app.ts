import "./env";

import * as Sentry from "@sentry/node";
import Database from "./data/database";

import { webServer } from "./webserver";
import WebSocketServer from "./WebSocketServer";
import { tmi } from "./tmi";
import { discord } from "./discord";
import { testConfig } from "../testConfig";
import { announce } from "./utils/twitchUtils";
import { TwitchAnnouncementColor } from "./data/types";

import "./webhooks";

import "./events/twitch/messages";
import "./events/twitch/follows";
import "./events/twitch/subscriptions";
import "./events/twitch/raids_incoming";
import "./events/twitch/cheers";
import "./events/twitch/redemptions";
import "./events/twitch/moods";

Database.connect();

(async () => {
  try {
    webServer.listen(process.env.PORT || 8999, () => {
      console.log(
        `p4nth3rb0t mainframe started on port ${
          (webServer.address() as any).port
        } :)`,
      );
    });

    await tmi.connect();
    await discord.login(process.env.DISCORD_TOKEN);

    WebSocketServer.create();

    if (testConfig.connectToFdgt) {
      setTimeout(() => {
        tmi.say(testConfig.channel, testConfig.command);
      }, 5000);
    }

    const announceMessage =
      process.env.NODE_ENV === "development"
        ? "I AM IN DEV MODE"
        : "p4nth3rPEWPEW Welcome to p4nth3rworld [object Object] p4nth3rPEWPEW";

    // Bot is online 🔥
    if (process.env.NODE_ENV !== "development") {
      await announce(announceMessage, TwitchAnnouncementColor.Primary);
    }
  } catch (error) {
    Sentry.captureException(error);
  }
})();

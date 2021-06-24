import "./env";

import Database from "./data/database";

import { webServer } from "./webserver";
import WebSocketServer from "./WebSocketServer";
import { tmi } from "./tmi";
import { discord } from "./discord";
import { testConfig } from "./../testConfig";
import { config } from "./config";

import "./webhooks";

import "./events/subscriptions";
import "./events/messages";
import "./events/raids";
import "./events/cheers";
import "./events/joins";
import "./events/follows";
import "./events/redemptions";
import "./events/moods";

Database.connect();

async function run() {
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

    // Bot is online 🔥
    tmi.say(config.channel, "whitep30PEWPEW [object Object] whitep30PEWPEW");
  } catch (error) {
    console.log(error);
  }
}

run();

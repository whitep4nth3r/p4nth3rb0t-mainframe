import { Client } from "tmi.js";
import { testConfig } from "../testConfig";

interface Connection {
  secure: boolean;
  reconnect: boolean;
  server?: string;
}

let connection: Connection = {
  secure: true,
  reconnect: true,
};

if (testConfig.connectToFdgt) {
  connection = {
    ...connection,
    server: "irc.fdgt.dev",
  };
}

export const tmi = new (Client as any)({
  options: { debug: process.env.NODE_ENV === "development" },
  connection,
  identity: {
    username: process.env.BOT_NAME,
    password: process.env.BOT_AUTH,
  },
  channels: process.env.CHANNELS?.split(","),
});

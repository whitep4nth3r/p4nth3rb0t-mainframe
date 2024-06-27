import { config } from "../config";
import { isValidPantherworldZone, PantherworldZones } from "../world/zones";
import {
  movePlayer,
  locatePlayer,
  claimItem,
  getInventory,
  listPopulation,
  dropItem,
  giftItem,
} from "../world/playerActions";
import { getRestOfMessage } from "../utils/commands";
import { tmi } from "./../tmi";
import { getLeaderboard, releaseUnclaimed } from "./leaderActions";
import { EventData, SpawnEventType, spawn } from "./spawn";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

export const WorldLeaderCommands = {
  "!release": async () => {
    await releaseUnclaimed();
  },
  "!leaderboard": async () => {
    await getLeaderboard();
  },
  "!test": async () => {
    await spawn({
      type: SpawnEventType.StreamOnline,
      data: { username: "whitep4nth3rskjdfsdkjfhskdjfh" },
    });
  },
  "!mfe": async () => {
    const events: EventData[] = [
      {
        type: SpawnEventType.StreamOnline,
        data: { username: "whitep4nth3r" },
      },
      {
        type: SpawnEventType.Cheer,
        data: { bits: 1000 },
      },
      {
        type: SpawnEventType.Follow,
        data: { username: "reactnorway" },
      },
      {
        type: SpawnEventType.Redeem,
        data: { reward: "skdjfskdjfsksdfkdfjksdfsodfsd" },
      },
      {
        type: SpawnEventType.Sub,
        data: { username: "reactnorway12345" },
      },
      {
        type: SpawnEventType.Hype,
        data: { level: 10 },
      },
      {
        type: SpawnEventType.StreamOnline,
        data: { username: "reactnorway12347" },
      },
      {
        type: SpawnEventType.Raid,
        data: { raiders: 4 },
      },
      {
        type: SpawnEventType.Follow,
        data: { username: "reactnorwaydddd" },
      },
      {
        type: SpawnEventType.Follow,
        data: { username: "reactnorwaysdlllllllllllll" },
      },
    ];

    for (let i = 0; i < 10; i++) {
      await spawn(events[i]);
    }
  },
};

export const WorldCommands = {
  "!map": async () => {
    const zones = PantherworldZones.map((zone) => zone.name).join(", ");
    tmi.say(config.channel, `${botPrefix}🗺️ Available zones: ${zones}`);
  },
  "!move": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      const zone = getRestOfMessage(message)[0];
      const isValid = isValidPantherworldZone(zone);
      if (isValid) {
        await movePlayer(tags["user-id"] as string, zone);
      } else {
        tmi.say(config.channel, `❌ Move failed: zone is void`);
      }
    }
  },
  "!locate": async (tags) => {
    if (!config.FREEZE_MODE) {
      await locatePlayer(
        tags["user-id"] as string,
        tags["display-name"] as string,
      );
    }
  },
  "!claim": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      const item = getRestOfMessage(message).join(" ");
      if (item !== "") {
        await claimItem(
          item,
          tags["user-id"] as string,
          tags["display-name"] as string,
        );
      }
    }
  },
  "!inventory": async (tags) => {
    if (!config.FREEZE_MODE) {
      await getInventory(
        tags["user-id"] as string,
        tags["display-name"] as string,
      );
    }
  },
  "!population": async () => {
    if (!config.FREEZE_MODE) {
      await listPopulation();
    }
  },
  "!drop": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      const item = getRestOfMessage(message).join(" ");
      if (item !== "") {
        await dropItem(
          item,
          tags["user-id"] as string,
          tags["display-name"] as string,
        );
      }
    }
  },
  "!gift": async (tags, message) => {
    // !gift receiver item
    if (!config.FREEZE_MODE) {
      const restOfMessage = getRestOfMessage(message);
      const receiver = restOfMessage[0];
      const item = restOfMessage[1];
      const giverId = tags["user-id"];
      const giverName = tags["display-name"];

      await giftItem(item, receiver, giverId, giverName);
    }
  },
};

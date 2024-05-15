import { config } from "../config";
import { isValidPantherworldZone, PantherworldZones } from "../world/zones";
import {
  movePlayer,
  locatePlayer,
  claimItem,
  getInventory,
  listPopulation,
} from "../world/playerActions";
import { getRestOfMessage } from "../utils/commands";
import { tmi } from "./../tmi";
import { getLeaderboard, releaseUnclaimed } from "./leaderActions";
// import { SpawnEventType, spawn } from "./spawn";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

export const WorldLeaderCommands = {
  "!release": async () => {
    await releaseUnclaimed();
  },
  "!leaderboard": async () => {
    await getLeaderboard();
  },
  // "!test": async () => {
  //   await spawn({
  //     type: SpawnEventType.Raid,
  //     data: { raiders: 1000 },
  //   });
  // },
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
};

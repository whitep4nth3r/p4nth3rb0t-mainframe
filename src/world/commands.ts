import { config } from "../config";
import { isValidPantherworldZone, PantherworldZones } from "../world/zones";
import { movePlayer } from "./actions/player/move";
import { locatePlayer } from "./actions/player/locate";
import { claimItem } from "./actions/player/claim";
import { getInventory } from "./actions/player/getInventory";
import { listPopulation } from "./actions/player/listPopulation";
import { throwItem } from "./actions/player/throw";
import { giftItem } from "./actions/player/gift";
import { getRestOfMessage } from "../utils/commands";
import { tmi } from "./../tmi";
import { getLeaderboard } from "./actions/leader/getLeaderboard";
import { releaseUnclaimed } from "./actions/leader/releaseUnclaimed";
import { EventData, SpawnEventType, spawn } from "./spawn";
import { wealthDistribution } from "./actions/wealth/wealthDistribution";

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
    tmi.say(config.channel, `${config.BOT_PREFIX}🗺️ Available zones: ${zones}`);
  },
  "!move": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      const zone = getRestOfMessage(message)[0];
      const isValid = isValidPantherworldZone(zone);
      if (isValid) {
        await movePlayer(tags["user-id"] as string, zone);
      } else {
        tmi.say(
          config.channel,
          `${config.BOT_PREFIX}❌ Move failed: zone is void`,
        );
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
  "!throw": async (tags, message) => {
    if (!config.FREEZE_MODE) {
      const item = getRestOfMessage(message).join(" ");
      if (item !== "") {
        await throwItem(
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
      const item = getRestOfMessage(message).slice(1).join(" ");
      const giverId = tags["user-id"];
      const giverName = tags["display-name"];
      await giftItem(item, receiver, giverId, giverName);
    }
  },
};

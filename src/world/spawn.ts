import { config } from "../config";
import { getRandomEntry } from "../utils/getRandomEntry";
import { saveItem } from "./itemActions";
import { tmi } from "../tmi";
import { WorldItems } from "./items";
import type { WorldItem } from "./items";
import { PantherworldZones } from "./zones";
import {
  MainframeEvent,
  ItemSpawnPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebsocketServer from "../WebSocketServer";
import { sendPantherworldFeedEvent } from "../discord";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

export enum SpawnEventType {
  Follow = "Follow",
  Cheer = "Cheer",
  Redeem = "Redeem",
  Sub = "Sub",
  Raid = "raid",
  Hype = "hype",
}

type EventData =
  | { type: SpawnEventType.Cheer; data: { bits: number } }
  | { type: SpawnEventType.Follow; data: { username: string } }
  | { type: SpawnEventType.Redeem; data: { reward: string } }
  | { type: SpawnEventType.Sub; data: { username: string } }
  | { type: SpawnEventType.Hype; data: { level: number } }
  | { type: SpawnEventType.Raid; data: { raiders: number } };

function calculateEventRarity(event: EventData): number {
  switch (event.type) {
    case SpawnEventType.Redeem:
      return event.data.reward.length;
    case SpawnEventType.Follow:
      return event.data.username.length;
    case SpawnEventType.Cheer:
      return event.data.bits;
    case SpawnEventType.Sub:
      return event.data.username.length;
    case SpawnEventType.Raid:
      return event.data.raiders;
    case SpawnEventType.Hype:
      return event.data.level;
    default:
      return 1;
  }
}

function calculateEligibleItems(rarity: number): any[] {
  const exactRarityItems = WorldItems.filter((item) => item.rarity === rarity);

  if (exactRarityItems.length) {
    return exactRarityItems;
  }

  // todo: change 0.8 to different weightings one day
  // could we do Math.random() > Math.random()?
  const goHigher = Math.random() > 0.8;

  const otherRarityItems = goHigher
    ? WorldItems.filter((item) => item.rarity > rarity)
    : WorldItems.filter((item) => item.rarity < rarity);

  return otherRarityItems;
}

export async function spawn(event: EventData): Promise<void> {
  const rarity = calculateEventRarity(event);

  const eligibleItems: WorldItem[] = calculateEligibleItems(rarity);

  const itemToSpawn: WorldItem = getRandomEntry(eligibleItems);
  //todo rare items should spawn in zones where they are fewer people
  const spawnZone = getRandomEntry(PantherworldZones);

  await saveItem(itemToSpawn.name, spawnZone.name);

  const message = `${botPrefix}🌍 ${itemToSpawn.name} spawned in the ${spawnZone.name} zone (rarity: ${itemToSpawn.rarity})`;

  tmi.say(config.channel, message);

  await sendPantherworldFeedEvent(message);

  const spawnEvent: ItemSpawnPacket = {
    event: MainframeEvent.itemSpawn,
    id: spawnZone.name + "-" + itemToSpawn.name + "-" + Date.now(),
    type: "spawn",
    data: {
      zone: spawnZone.name,
      item: itemToSpawn,
    },
  };

  WebsocketServer.sendData(spawnEvent);
}

import { config } from "../config";
import { getRandomEntry } from "../utils/getRandomEntry";
import { saveItem } from "./itemActions";
import { tmi } from "../tmi";
import { WorldItems } from "./items/all";
import type { WorldItem } from "./items/all";
import {
  MainframeEvent,
  ItemSpawnPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebsocketServer from "../WebSocketServer";
import { sendPantherworldFeedEvent } from "../discord";
import { PantherworldZones } from "./zones";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

export enum SpawnEventType {
  Follow = "Follow",
  Cheer = "Cheer",
  Redeem = "Redeem",
  Sub = "Sub",
  Raid = "raid",
  Hype = "hype",
  StreamOnline = "streamonline",
}

type EventData =
  | { type: SpawnEventType.Cheer; data: { bits: number } }
  | { type: SpawnEventType.Follow; data: { username: string } }
  | { type: SpawnEventType.Redeem; data: { reward: string } }
  | { type: SpawnEventType.Sub; data: { username: string } }
  | { type: SpawnEventType.Hype; data: { level: number } }
  | { type: SpawnEventType.StreamOnline; data: { username: string } }
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
    case SpawnEventType.StreamOnline:
      return event.data.username.length * 20;
    case SpawnEventType.Hype:
      return event.data.level;
    default:
      return 1;
  }
}

export function getZoneBasedItemsIfPossible(zone: string) {
  if (WorldItems.find((item) => item.onlyZone === zone)) {
    return WorldItems.filter((item) => item.onlyZone === zone);
  } else {
    return WorldItems.filter((item) => item.onlyZone === null);
  }
}

function calculateEligibleItems(rarity: number, zone: string): any[] {
  const eligibleZoneItems = getZoneBasedItemsIfPossible(zone);

  const exactRarityItems = eligibleZoneItems.filter(
    (item) => item.rarity === rarity,
  );

  if (exactRarityItems.length) {
    return exactRarityItems;
  }

  // todo: change 0.8 to different weightings one day
  // could we do Math.random() > Math.random()?
  const goHigher = Math.random() > 0.8;

  const otherRarityItems = goHigher
    ? eligibleZoneItems.filter((item) => item.rarity > rarity)
    : eligibleZoneItems.filter((item) => item.rarity < rarity);

  if (otherRarityItems.length > 0) {
    return otherRarityItems;
  } else {
    // to account for no items matching the rarity calculation, just return eligible zone items
    return eligibleZoneItems;
  }
}

export async function spawn(event: EventData): Promise<void> {
  const rarity = calculateEventRarity(event);

  const spawnZone = getRandomEntry(PantherworldZones);

  const eligibleItems: WorldItem[] = calculateEligibleItems(
    rarity,
    spawnZone.name,
  );

  const itemToSpawn: WorldItem = getRandomEntry(eligibleItems);

  await saveItem(itemToSpawn.name, itemToSpawn.rarity, spawnZone.name);

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

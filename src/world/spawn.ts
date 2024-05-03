import { config } from "../config";
import { getRandomEntry } from "../utils/getRandomEntry";
import { saveItem } from "./itemActions";
import { tmi } from "../tmi";
import Items from "./items";
import { PantherworldZones } from "./zones";
import {
  MainframeEvent,
  ItemSpawnPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebsocketServer from "../WebSocketServer";
import { sendPantherworldFeedEvent } from "../discord";

/**
    todo - add a !claim function for users ✅
    save what they have claimed in DB ✅

    add a !move function for users to move around zones ✅
    save user's zone positions ✅
    users can only claim when they are in that zone ✅
    add a !inventory function for users to check what's in their inventory ✅

    when users type !locate gets their current zone and sends message ✅

    add a !population command to find out how many people are in each zone ✅

    mini overlay to show players moving and claiming and stuff ✅

    blog post about how to play

    fix some bugs (see Sentry)

    move spawn commands to separate area for clarity

    add a !leaderboard function to see who's got the most?

    unclaimed item party — where all unclaimed items are released for grabs
   */

/**
 * when users type !move {zone}
 * they move to {zone}
 * TODO: it takes time to move between zones
 * update record in db
 */

/**
 * more ideas
 * !craft
 * !recipes
 * !gift
 */

export enum SpawnEventType {
  Follow = "Follow",
  Cheer = "Cheer",
  Redeem = "Redeem",
  Sub = "Sub",
  Raid = "raid",
}

type EventData =
  | { type: SpawnEventType.Cheer; data: { bits: number } }
  | { type: SpawnEventType.Follow; data: { username: string } }
  | { type: SpawnEventType.Redeem; data: { reward: string } }
  | { type: SpawnEventType.Sub; data: { username: string } }
  | { type: SpawnEventType.Raid; data: { raiders: number } };

function getArticle(name: string): string {
  const startsWithVowel =
    name.startsWith("a") ||
    name.startsWith("e") ||
    name.startsWith("i") ||
    name.startsWith("o") ||
    name.startsWith("u");

  return startsWithVowel ? "An" : "A";
}

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
    default:
      return 1;
  }
}

function calculateEligibleItems(rarity: number): any[] {
  const exactRarityItems = Items.filter((item) => item.rarity === rarity);

  if (exactRarityItems.length) {
    return exactRarityItems;
  }

  // todo: change 0.8 to different weightings one day
  // could we do Math.random() > Math.random()?
  const goHigher = Math.random() > 0.8;

  const otherRarityItems = goHigher
    ? Items.filter((item) => item.rarity > rarity)
    : Items.filter((item) => item.rarity < rarity);

  return otherRarityItems;
}

export async function spawn(event: EventData): Promise<void> {
  const rarity = calculateEventRarity(event);
  const eligibleItems = calculateEligibleItems(rarity);
  const itemToSpawn = getRandomEntry(eligibleItems);
  //todo rare items should spawn in zones where they are fewer people
  const spawnZone = getRandomEntry(PantherworldZones);

  await saveItem(itemToSpawn.name, spawnZone.name);

  const message = `🌍 ${getArticle(itemToSpawn.name)} ${
    itemToSpawn.name
  } spawned in the ${spawnZone.name} zone`;

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

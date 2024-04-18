import { config } from "../config";
import { getRandomEntry } from "../utils/getRandomEntry";
import { saveItem } from "./itemActions";
import { tmi } from "../tmi";

export enum SpawnEventType {
  Follow = "Follow",
  Cheer = "Cheer",
  Redeem = "Redeem",
  Sub = "Sub",
}

import Items from "./items";
import { PantherworldZones } from "./zones";

type EventData =
  | { type: SpawnEventType.Cheer; data: { bits: number } }
  | { type: SpawnEventType.Follow; data: { username: string } }
  | { type: SpawnEventType.Redeem; data: { reward: string } }
  | { type: SpawnEventType.Sub; data: { username: string } };

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

  await saveItem(itemToSpawn, spawnZone);

  /**
   * time limit for claiming is 30 seconds
   */

  /**
   * when users type !move {zone}
   * they move to {zone}
   * TODO: it takes time to move between zones
   * update record in db
   */

  /**
   * mini overlay to show players moving and claiming and stuff
   */

  tmi.say(
    config.channel,
    `🌍 ${getArticle(itemToSpawn.name)} ${itemToSpawn.name} spawned in the ${
      spawnZone.name
    } zone 🌍`,
  );

  // todo - add a !claim function for users
  // save what they have claimed in DB

  // add a !move function for users to move around zones ✅
  // save user's zone positions ✅
  // users can only claim when they are in that zone

  /**
   * when users type !locate ✅
   * gets their current zone and sends message ✅
   */

  /**
   * add a command to find out how many people are in each zone
   */

  // add a !check function for users to check what's in their inventory

  // add a !leaderboard function to see who's got the most?
}

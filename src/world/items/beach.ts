import { ItemCategory, WorldItem } from "./../api/types";
import { PantherworldZoneNames } from "../zones";

export const BeachItems: WorldItem[] = [
  {
    rarity: 1,
    name: "sand",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.MINERAL],
  },
  {
    rarity: 2,
    name: "driftwood",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.WOOD],
  },
  {
    rarity: 3,
    name: "seaweed",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.PLANT],
  },
  {
    rarity: 5,
    name: "dead coral",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.ANIMAL, ItemCategory.DEAD],
  },
  {
    rarity: 9,
    name: "shingle",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.MINERAL],
  },
  {
    rarity: 15,
    name: "cuttlefish bone",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.ANIMAL, ItemCategory.DEAD, ItemCategory.MINERAL],
  },
  {
    rarity: 200,
    name: "sea salt",
    onlyZone: PantherworldZoneNames.Beach,
    flavours: ["salty"],
    categories: [ItemCategory.MINERAL],
  },
  {
    rarity: 300,
    name: "anemone",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.ANIMAL, ItemCategory.ALIVE],
  },
  {
    rarity: 500,
    name: "fishing net",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.TOOL],
  },
  {
    rarity: 600,
    name: "clam shell",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.MINERAL, ItemCategory.DEAD, ItemCategory.ANIMAL],
  },
  {
    rarity: 600,
    name: "mussel shell",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.MINERAL, ItemCategory.DEAD, ItemCategory.ANIMAL],
  },
  {
    rarity: 600,
    name: "scallop shell",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.DEAD, ItemCategory.ANIMAL],
  },
  {
    rarity: 600,
    name: "conch shell",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.DEAD, ItemCategory.ANIMAL],
  },
  {
    rarity: 600,
    name: "whelk shell",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.DEAD, ItemCategory.ANIMAL],
  },
  {
    rarity: 900,
    name: "crab claw",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.DEAD, ItemCategory.ANIMAL],
  },
  {
    rarity: 1000,
    name: "oyster shell",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.DEAD, ItemCategory.ANIMAL],
  },
  {
    rarity: 1200,
    name: "red seaweed",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.PLANT],
  },
  {
    rarity: 1500,
    name: "live coral",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.ALIVE, ItemCategory.ANIMAL],
  },
  {
    rarity: 2000,
    name: "lobster claw",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.DEAD, ItemCategory.ANIMAL],
  },
  {
    rarity: 5000,
    name: "pearl",
    onlyZone: PantherworldZoneNames.Beach,
    categories: [ItemCategory.MINERAL, ItemCategory.GEMSTONE],
  },
];

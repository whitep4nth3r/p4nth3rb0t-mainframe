import { ItemCategory, WorldItem } from "./../api/types";
import { PantherworldZoneNames } from "../zones";

export const SwampItems: WorldItem[] = [
  {
    rarity: 1,
    name: "toxic waste",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.CLASSIFIED],
  },
  {
    rarity: 3,
    name: "rotten egg",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.EGG, ItemCategory.ANIMAL],
  },
  {
    rarity: 4,
    name: "irradiated pineapple",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.FRUIT, ItemCategory.BERRY],
  },
  {
    rarity: 9,
    name: "irradiated green olive",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.FRUIT],
  },
  {
    rarity: 10,
    name: "irradiated avocado",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.FRUIT],
  },
  {
    rarity: 10,
    name: "irradiated croissant",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.PASTRY],
  },
  {
    rarity: 50,
    name: "irradiated parchment paper",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.TOOL, ItemCategory.WOOD],
  },
  {
    rarity: 55,
    name: "glowing mushroom",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.VEGETABLE],
  },
  {
    rarity: 60,
    name: "irradiated stick of butter",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.DAIRY, ItemCategory.ANIMAL],
  },
  {
    rarity: 85,
    name: "irradiated pine cone",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.SEED],
  },
  {
    rarity: 210,
    name: "irradiated coal",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.MINERAL],
  },
  {
    rarity: 420,
    name: "irradiated leaf",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.PLANT],
  },
  {
    rarity: 420,
    name: "irradiated feather",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.ANIMAL],
  },
  {
    rarity: 420,
    name: "irradiated pebble",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.MINERAL],
  },
  {
    rarity: 420,
    name: "irradiated stick",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.WOOD],
  },
  {
    rarity: 900,
    name: "irradiated seven leaf clover",
    onlyZone: PantherworldZoneNames.Swamp,
    categories: [ItemCategory.PLANT],
  },
];

import { ItemCategory, WorldItem } from "./../api/types";

export const Animal: WorldItem[] = [
  {
    rarity: 8,
    name: "chicken egg",
    onlyZone: null,
    categories: [ItemCategory.EGG, ItemCategory.ANIMAL],
  },
  {
    rarity: 48,
    name: "wood pigeon feather",
    onlyZone: null,
    categories: [ItemCategory.FEATHER, ItemCategory.ANIMAL],
  },
  {
    rarity: 70,
    name: "quail egg",
    onlyZone: null,
    categories: [ItemCategory.EGG, ItemCategory.ANIMAL],
  },
];

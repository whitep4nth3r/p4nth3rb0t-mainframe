import { ItemCategory, WorldItem } from "./../api/types";

export const Instruments: WorldItem[] = [
  {
    rarity: 750,
    name: "wooden flute",
    onlyZone: null,
    categories: [ItemCategory.WOOD, ItemCategory.MUSICAL_INSTRUMENT],
  },
  {
    rarity: 950,
    name: "bongo drum",
    onlyZone: null,
    categories: [ItemCategory.WOOD, ItemCategory.MUSICAL_INSTRUMENT],
  },
  {
    rarity: 1250,
    name: "golden lute",
    onlyZone: null,
    categories: [ItemCategory.MUSICAL_INSTRUMENT, ItemCategory.MINERAL],
  },
];

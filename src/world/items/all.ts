import { Vegetables } from "./vegetables";
import { SwampItems } from "./swamp";
import { UniversalItems } from "./universal";
import { Herbs } from "./herbs";
import { Fruits } from "./fruits";
import { Flowers } from "./flowers";
import { Plants } from "./plants";
import { Gems } from "./gems";
import { Animal } from "./animal";
import { Instruments } from "./instruments";

export type WorldItem = {
  rarity: number;
  name: string;
  onlyZone: string | null;
};

export const WorldItems: WorldItem[] = [
  ...Animal,
  ...Gems,
  ...Herbs,
  ...Flowers,
  ...Fruits,
  ...Plants,
  ...Instruments,
  ...SwampItems,
  ...Vegetables,
  ...UniversalItems,
];

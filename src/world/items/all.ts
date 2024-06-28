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
import { Natural } from "./natural";

export type WorldItem = {
  rarity: number;
  name: string;
  onlyZone: string | null;
  flavour?: string; //// Potential idea for naming recipes
};

export const WorldItems: WorldItem[] = [
  ...Animal,
  ...Flowers,
  ...Fruits,
  ...Gems,
  ...Herbs,
  ...Instruments,
  ...Natural,
  ...Plants,
  ...SwampItems,
  ...UniversalItems,
  ...Vegetables,
];

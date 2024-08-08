import { BeachItems } from "./beach";
import { Geological } from "./geological";
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
import { WorldItem } from "../api/types";
import { Legumes } from "./legumes";
import { Spices } from "./spices";

export const WorldItems: WorldItem[] = [
  ...Animal,
  ...BeachItems,
  ...Flowers,
  ...Fruits,
  ...Gems,
  ...Geological,
  ...Herbs,
  ...Instruments,
  ...Legumes,
  ...Natural,
  ...Plants,
  ...Spices,
  ...SwampItems,
  ...UniversalItems,
  ...Vegetables,
];

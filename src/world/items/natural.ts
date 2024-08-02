import { WorldItem } from "../api/types";

export const Natural: WorldItem[] = [
  { rarity: 2, name: "wheat", onlyZone: null },
  {
    rarity: 3,
    name: "peanut",
    onlyZone: null,
    flavours: ["nutty", "roasted", "crunchy"],
  },
  { rarity: 4, name: "corn", onlyZone: null },
  { rarity: 6, name: "white rice", onlyZone: null },
  { rarity: 10, name: "barley", onlyZone: null },
  { rarity: 16, name: "brown rice", onlyZone: null },
  { rarity: 20, name: "spelt", onlyZone: null },
  {
    rarity: 22,
    name: "walnut",
    onlyZone: null,
    flavours: ["nutty", "crunchy", "earthy", "bold"],
  },
  { rarity: 24, name: "rye", onlyZone: null },
  { rarity: 46, name: "wild rice", onlyZone: null },
  {
    rarity: 55,
    name: "acorn",
    onlyZone: null,
  },
  {
    rarity: 60,
    name: "bag of oats",
    onlyZone: null,
  },
  {
    rarity: 100,
    name: "almond",
    onlyZone: null,
    flavours: ["nutty", "savoury", "earthy", "crunchy"],
  },
  {
    rarity: 106,
    name: "chestnut",
    onlyZone: null,
    flavours: ["nutty", "creamy", "earthy", "bold", "crunchy"],
  },
  {
    rarity: 120,
    name: "pistachio",
    onlyZone: null,
    flavours: ["nutty", "creamy", "rich", "savoury", "crunchy"],
  },
  {
    rarity: 200,
    name: "hazelnut",
    onlyZone: null,
    flavours: ["sweet", "earthy", "rich", "crunchy"],
  },
  {
    rarity: 750,
    name: "pecan nut",
    onlyZone: null,
    flavours: ["nutty", "earthy", "rich", "soft"],
  },
];

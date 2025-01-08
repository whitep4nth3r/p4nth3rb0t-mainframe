import { ItemCategory, WorldItem } from "./../api/types";

export const Spices: WorldItem[] = [
  {
    rarity: 200,
    name: "black pepper",
    onlyZone: null,
    flavours: ["peppery", "spicy", "hot"],
    categories: [ItemCategory.FRUIT, ItemCategory.SPICE],
  },
  {
    rarity: 210,
    name: "cumin seeds",
    onlyZone: null,
    flavours: ["earthy", "warm", "nutty"],
    categories: [ItemCategory.SEED, ItemCategory.SPICE],
  },
  {
    rarity: 215,
    name: "cardamom pods",
    onlyZone: null,
    flavours: ["floral", "citrusy", "herbal", "spicy"],
    categories: [ItemCategory.SEED, ItemCategory.SPICE],
  },
  {
    rarity: 220,
    name: "cinnamon stick",
    onlyZone: null,
    flavours: ["woody", "aromatic", "sweet", "spicy"],
    categories: [ItemCategory.WOOD, ItemCategory.SPICE],
  },
  {
    rarity: 230,
    name: "cloves",
    onlyZone: null,
    flavours: ["woody", "aromatic", "medicinal"],
    categories: [ItemCategory.SPICE],
  },
  {
    rarity: 240,
    name: "whole nutmeg",
    onlyZone: null,
    flavours: ["earthy", "nutty", "sweet 'n' spicy", "aromatic", "bitter"],
    categories: [ItemCategory.SEED, ItemCategory.SPICE],
  },
  {
    rarity: 530,
    name: "turmeric root",
    onlyZone: null,
    flavours: ["earthy", "nutty", "aromatic"],
    categories: [ItemCategory.HERB, ItemCategory.SPICE],
  },
];

import { FoodRecipes } from "./food";
import { WorldItem } from "../items/all";

export type Recipe = {
  ingredients: {
    primary: WorldItem;
    secondary: WorldItem[];
  };
};

//name and rarity are calculated at the time of crafting

export const WorldRecipes: Recipe[] = [...FoodRecipes];

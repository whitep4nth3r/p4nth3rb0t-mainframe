import { Recipe } from "../api/types";
import { FoodRecipes } from "./food";

export const WorldRecipes: Record<string, Recipe> = { ...FoodRecipes };

import { WorldRecipes } from "../recipes/all";
import { RecipeMeta, RecipesResponse } from "./types";

export function getRecipes(): RecipesResponse {
  const recipes = [];

  Object.entries(WorldRecipes).forEach(([, recipe]) => {
    recipes.push({
      title: recipe.title,
      description: recipe.description,
    } as RecipeMeta);
  });

  return recipes;
}

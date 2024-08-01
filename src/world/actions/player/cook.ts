import { Recipe, WorldItem } from "./../../api/types";
import { WorldRecipes } from "../../recipes/all";
import { getCommandFromMessage } from "../../../utils/commands";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import { config } from "../../../config";
import { tmi } from "../../../tmi";
import { WorldItems } from "../../items/all";
import { getRandomEntry } from "../../../utils/getRandomEntry";

export function getIngredientsFromCraftCommand(message: string) {
  const command = getCommandFromMessage(message);
  const ingredientsList = message.replace(command, "");

  return ingredientsList.split("+").map((item) => item.trim());
}

// this should say can cook
// !craft green olive + garlic bulb + fresh basil

// not cook
// !craft green olive + emerald

function getCannotCookMsg(username) {
  return `❌ @${username} cannot cook!`;
}

export function getCombinedRarity(ingredientList: string[]) {
  let combinedRarity = 0;

  WorldItems.forEach((item) => {
    if (ingredientList.includes(item.name)) {
      combinedRarity += item.rarity;
    }
  });

  return combinedRarity;
}

export function findRecipe(ingredient: string): Recipe | null {
  let foundRecipe = null;

  Object.entries(WorldRecipes).forEach(([, recipe]) => {
    if (recipe.ingredients.primary.name === ingredient) {
      foundRecipe = recipe;
    }
  });

  return foundRecipe;
}

export function findSecondaryIngredients(
  recipeMatch: Recipe,
  ingredientList: string[],
): WorldItem[] {
  const matched = [];

  ingredientList.forEach((ingredient) => {
    recipeMatch.ingredients.secondary.forEach((secondaryIngredient) => {
      if (secondaryIngredient.name === ingredient) {
        matched.push(secondaryIngredient);
      }
    });
  });

  return matched;
}

export async function cookItem(
  recipe: string,
  userId: string,
  username: string,
): Promise<void> {
  const ingredientList = getIngredientsFromCraftCommand(recipe);
  console.log(ingredientList);

  const allUserItems = await PantherworldItemModel.aggregate([
    // Match documents with a specific userId
    { $match: { userId: userId } },
    // Group documents by name, count the number of items in each group
    { $group: { _id: "$name", count: { $sum: 1 } } },
  ]);

  // 1. check to see if user has all of the ingredients specified ✅
  for (let i = 0; i < ingredientList.length; i++) {
    if (allUserItems.some((item) => item._id === ingredientList[i]) === false) {
      tmi.say(
        config.channel,
        `${config.BOT_PREFIX}${getCannotCookMsg(username)}`,
      );
      return;
    }
  }

  // 2. check if recipe available
  // ALWAYS JUST ONE RECIPE WITH THAT PRIMARY INGREDIENT
  // Combos are created with the secondary items
  const recipeMatch = findRecipe(ingredientList[0]);

  if (recipeMatch === null) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}${getCannotCookMsg(username)}`,
    );
    return;
  }

  // Check to see if any ingredients match secondary ✅
  const matchedSecondaryIngredients: WorldItem[] = findSecondaryIngredients(
    recipeMatch,
    ingredientList,
  );

  if (matchedSecondaryIngredients.length === 0) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}${getCannotCookMsg(username)}`,
    );
    return;
  }

  // Calculate the rarity of all ingredients (with some probability of a multiplier)
  const combinedRarity = getCombinedRarity(ingredientList);

  // 30% chance of a multiplier
  const doMultiplier = Math.random() >= 0.3;

  // multiplier is a random rarity from one of the ingredients
  const finalRarity = doMultiplier
    ? combinedRarity * getRandomEntry(matchedSecondaryIngredients).rarity
    : combinedRarity;

  // calculate name

  /**
   * 3.
   * PROBABILITY OF SPOILING (maybe based on wealth index)
   * // apply wealth distribution
   * 5. save in DB
   * 6. send relevant tmi.say and discord messages and websocket event
   */
}

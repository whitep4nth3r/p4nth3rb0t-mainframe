import { WorldRecipes } from "../../recipes/all";
import { getCommandFromMessage } from "../../../utils/commands";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import { config } from "../../../config";
import { tmi } from "../../../tmi";

export function getIngredientsFromCraftCommand(message: string) {
  const command = getCommandFromMessage(message);
  const ingredientsList = message.replace(command, "");

  return ingredientsList.split("+").map((item) => item.trim());
}

// this should say can craft
// !craft green olive + garlic bulb + fresh basil

// !craft green olive + emerald

function getCannotCraftMsg(username) {
  return `❌ @${username} cannot craft!`;
}

export async function cookItem(
  recipe: string,
  userId: string,
  username: string,
): Promise<void> {
  const ingredientList = getIngredientsFromCraftCommand(recipe);

  const allItems = await PantherworldItemModel.aggregate([
    // Match documents with a specific userId
    { $match: { userId: userId } },
    // Group documents by name, count the number of items in each group
    { $group: { _id: "$name", count: { $sum: 1 } } },
  ]);

  // 1. check to see if user has all of the ingredients specified ✅
  for (let i = 0; i < ingredientList.length; i++) {
    if (allItems.some((item) => item._id === ingredientList[i]) === false) {
      tmi.say(
        config.channel,
        `${config.BOT_PREFIX}${getCannotCraftMsg(username)}`,
      );
      return;
    }
  }

  // 2. check if recipe available
  // ALWAYS JUST ONE RECIPE WITH THAT PRIMARY INGREDIENT
  // Combos are created with the secondary items
  const recipeWithPrimaryIngredient = WorldRecipes.find(
    (item) => item.ingredients.primary.name === ingredientList[0],
  );

  if (recipeWithPrimaryIngredient === undefined) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}${getCannotCraftMsg(username)}`,
    );
    return;
  }

  /**
   *
   * 2. check to see if any ingredients match secondary
   * 3. calculate the rarity
   * 4. calculate a name (somehow)
   * 5. save in DB
   * 6. send relevant tmi.say and discord messages and websocket event
   */
}

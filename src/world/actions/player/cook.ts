import * as Sentry from "@sentry/node";
import { PantherworldEvent, Recipe, WorldItem } from "./../../api/types";
import { WorldRecipes } from "../../recipes/all";
import { getCommandFromMessage } from "../../../utils/commands";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
import { config } from "../../../config";
import { tmi } from "../../../tmi";
import { WorldItems } from "../../items/all";
import { getRandomEntry } from "../../../utils/getRandomEntry";
import { getWealthIndex } from "../wealth/wealthDistribution";
import { saveItem } from "../../itemActions";
import { sendPantherworldFeedEvent } from "../../../discord";
import {
  MainframeEvent,
  PlayerCookFailPacket,
  PlayerCookPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebsocketServer from "../../../WebSocketServer";

// !cook green olive + fresh red chilli + fresh parsley

export function getIngredientsFromCraftCommand(message: string) {
  const command = getCommandFromMessage(message);
  const ingredientsList = message.replace(command, "");

  return ingredientsList.split("+").map((item) => item.trim());
}

function getCannotCookMsg(username: string): string {
  return `@${username} cannot cook!`;
}

function getSpoiledMessage(username: string, ingredientList: string[]): string {
  return `@${username} your recipe spoiled! You lost ${ingredientList.join(", ")!}`;
}

function getCookedMessage(
  username: string,
  uniqueName: string,
  rarity: number,
): string {
  return `@${username} cooked ${uniqueName} (rarity: ${rarity})!`;
}

function shuffle(array) {
  let currentIndex = array.length;

  // While there remain elements to shuffle...
  while (currentIndex != 0) {
    // Pick a remaining element...
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }

  return array;
}

export function makeUniqueRecipeName(
  recipe: Recipe,
  ingredientList: string[],
): string {
  const secondaryIngredients = [];

  recipe.ingredients.secondary.forEach((item) => {
    if (ingredientList.includes(item.name)) {
      secondaryIngredients.push(item);
    }
  });

  const flavours = secondaryIngredients.map((item) =>
    getRandomEntry(item.flavours),
  );

  const uniqueFlavours = flavours.filter(
    (item, index) => flavours.indexOf(item) === index,
  );

  const shuffledUnique = shuffle(uniqueFlavours);

  const endWord = getRandomEntry(recipe.names);

  return `${shuffledUnique.join(" ")} ${recipe.ingredients.primary.name} ${endWord}`;
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
        `${config.BOT_PREFIX}❌ ${getCannotCookMsg(username)}`,
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
  const doMultiplier = Math.random() >= 0.7;

  // multiplier is a random rarity from one of the ingredients
  const finalRarity = doMultiplier
    ? combinedRarity * getRandomEntry(matchedSecondaryIngredients).rarity
    : combinedRarity;

  // calculate name
  const uniqueName = makeUniqueRecipeName(recipeMatch, ingredientList);

  // 10% probability of spoiling for all
  // 25% probabilty of spoiling if wealth index > 50000
  // all items get DESTROYED
  const userWealthIndex = getWealthIndex(allUserItems);
  const willSpoil =
    userWealthIndex > 50000 ? Math.random() >= 0.75 : Math.random() >= 0.9;

  // delete all raw ingredients from user
  const promises = [];
  for (let i = 1; i <= ingredientList.length; i++) {
    promises.push(
      await PantherworldItemModel.deleteOne({
        name: ingredientList[i],
        userId: userId,
      }),
    );
  }

  await Promise.all(promises)
    .then(() => console.log("deleted"))
    .catch((err) => {
      Sentry.captureException(err);
    });

  if (willSpoil) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}🤮 ${getSpoiledMessage(username, ingredientList)}`,
    );
    await sendPantherworldFeedEvent(
      getSpoiledMessage(username, ingredientList),
      PantherworldEvent.COOK_FAILED,
      config.BOT_PREFIX,
    );

    const playerCookFailEvent: PlayerCookFailPacket = {
      event: MainframeEvent.playerCookFail,
      id: userId + "-" + Date.now(),
      type: "cookfail",
      data: {
        username: username,
        ingredientList: ingredientList,
      },
    };

    WebsocketServer.sendData(playerCookFailEvent);
  } else {
    const currentPlayer = await PantherworldPlayerModel.findOne({
      userId: userId,
    });

    await saveItem(uniqueName, finalRarity, currentPlayer.zone, true);
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}🍳 ${getCookedMessage(username, uniqueName, finalRarity)}`,
    );

    await sendPantherworldFeedEvent(
      getCookedMessage(username, uniqueName, finalRarity),
      PantherworldEvent.COOKED,
      config.BOT_PREFIX,
    );

    const playerCookEvent: PlayerCookPacket = {
      event: MainframeEvent.playerCook,
      id: userId + "-" + Date.now(),
      type: "cook",
      data: {
        username: username,
        recipe: uniqueName,
        rarity: finalRarity,
      },
    };

    WebsocketServer.sendData(playerCookEvent);
  }
}

import * as Sentry from "@sentry/node";
import { PantherworldEvent, Recipe, WorldItem } from "./../../api/types";
import { WorldRecipes } from "../../recipes/all";
import { getCommandFromMessage } from "../../../utils/commands";
import { database } from "../../../data/database";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { PantherworldPlayer } from "../../../data/entities/PantherworldPlayerEntity";
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
import WebsocketServer from "../../../classes/WebSocketServer";
import { getAllItemsForPlayer } from "../../api/player/allItems";

export function getIngredientsFromCraftCommand(message: string) {
  const command = getCommandFromMessage(message);
  const ingredientsList = message.replace(command, "");

  return ingredientsList.split("+").map((item) => item.trim());
}

function getCannotCookMsg(username: string): string {
  return `@${username} cannot cook!`;
}

function getSpoiledMessage(username: string, ingredientList: string[]): string {
  return `@${username} your recipe spoiled! You lost ${ingredientList.join(
    ", ",
  )!}`;
}

function getCookedMessage(
  username: string,
  uniqueName: string,
  rarity: number,
  unmatchedSecondaryIngredients?: string[],
): string {
  const unmatchedMessage =
    unmatchedSecondaryIngredients.length > 0
      ? ` and lost ${unmatchedSecondaryIngredients.join(", ")}`
      : "";

  return `@${username} cooked ${uniqueName} (rarity: ${rarity})${unmatchedMessage}!`;
}

function shuffle(array) {
  let currentIndex = array.length;

  while (currentIndex != 0) {
    const randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

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

  const flavours = secondaryIngredients.map((item) => {
    if (item.flavours && item.flavours.length > 0) {
      return getRandomEntry(item.flavours);
    }
  });

  let shuffledUnique = [];

  if (flavours.length > 0) {
    const uniqueFlavoursSet = new Set(flavours);
    const uniqueFlavours = Array.from(uniqueFlavoursSet) as any[];
    shuffledUnique = shuffle(uniqueFlavours);
  }

  const endWord = getRandomEntry(recipe.names);
  return `${shuffledUnique.join(" ")} ${
    recipe.ingredients.primary.name
  } ${endWord}`;
}

export function getCombinedRarity(ingredientList: WorldItem[]) {
  let combinedRarity = 0;

  WorldItems.forEach((item) => {
    if (ingredientList.find((ingredient) => item.name === ingredient.name)) {
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

export function findUnmatchedSecondaryIngredients(
  recipeMatch: Recipe,
  ingredientList: string[],
): string[] {
  const unmatched = [];

  ingredientList.forEach((ingredient) => {
    const isInSecondaryList = recipeMatch.ingredients.secondary.find(
      (item) => item.name === ingredient,
    );

    if (
      isInSecondaryList === undefined &&
      ingredient !== recipeMatch.ingredients.primary.name
    ) {
      unmatched.push(ingredient);
    }
  });

  return unmatched;
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
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const ingredientList = getIngredientsFromCraftCommand(recipe);

  const allUserItems = await getAllItemsForPlayer(userId);

  for (let i = 0; i < ingredientList.length; i++) {
    if (
      allUserItems.some((item) => item.name === ingredientList[i]) === false
    ) {
      tmi.say(
        config.channel,
        `${config.BOT_PREFIX}❌ ${getCannotCookMsg(username)}`,
      );
      return;
    }
  }

  const recipeMatch = findRecipe(ingredientList[0]);

  if (recipeMatch === null) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}${getCannotCookMsg(username)}`,
    );
    return;
  }

  const matchedSecondaryIngredients: WorldItem[] = findSecondaryIngredients(
    recipeMatch,
    ingredientList,
  );

  const unmatchedSecondaryIngredients: string[] =
    findUnmatchedSecondaryIngredients(recipeMatch, ingredientList);

  if (matchedSecondaryIngredients.length === 0) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}${getCannotCookMsg(username)}`,
    );
    return;
  }

  const combinedRarity = getCombinedRarity(matchedSecondaryIngredients);

  const doMultiplier = Math.random() >= 0.7;

  const finalRarity = doMultiplier
    ? combinedRarity * getRandomEntry(matchedSecondaryIngredients).rarity
    : combinedRarity;

  const uniqueName = makeUniqueRecipeName(recipeMatch, ingredientList);

  const userWealthIndex = getWealthIndex(allUserItems);
  const willSpoil =
    userWealthIndex > 50000 ? Math.random() >= 0.75 : Math.random() >= 0.95;

  const itemUpdates = [];

  if (willSpoil) {
    for (let i = 0; i < ingredientList.length; i++) {
      const item = await itemRepository.findOne({
        where: {
          name: ingredientList[i],
          userId: userId,
          used: false,
          spoiled: false,
          cooked: false,
        },
      });
      if (item) {
        item.spoiled = true;
        itemUpdates.push(itemRepository.save(item));
      }
    }

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
    for (let i = 0; i < ingredientList.length; i++) {
      const item = await itemRepository.findOne({
        where: {
          name: ingredientList[i],
          userId: userId,
          used: false,
          spoiled: false,
          cooked: false,
        },
      });
      if (item) {
        item.used = true;
        itemUpdates.push(itemRepository.save(item));
      }
    }

    const currentPlayer = await playerRepository.findOne({
      where: { id: userId },
    });

    await saveItem(uniqueName, finalRarity, currentPlayer.zone, true, userId);

    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}🍳 ${getCookedMessage(
        username,
        uniqueName,
        finalRarity,
        unmatchedSecondaryIngredients,
      )}`,
    );

    await sendPantherworldFeedEvent(
      getCookedMessage(
        username,
        uniqueName,
        finalRarity,
        unmatchedSecondaryIngredients,
      ),
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
        lost: unmatchedSecondaryIngredients,
      },
    };

    WebsocketServer.sendData(playerCookEvent);
  }

  await Promise.all(itemUpdates)
    .then(() => console.log("updated all items"))
    .catch((err) => {
      Sentry.captureException(err);
    });
}

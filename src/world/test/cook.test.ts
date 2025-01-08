import { FoodRecipes } from "./../recipes/food";
import {
  findRecipe,
  findSecondaryIngredients,
  findUnmatchedSecondaryIngredients,
  getCombinedRarity,
  makeUniqueRecipeName,
  getIngredientsFromCraftCommand,
} from "../actions/player/cook";
import { WorldItems } from "../items/all";
import { Vegetables } from "../items/vegetables";
import { Herbs } from "../items/herbs";
const MarinatedGreenOlives = FoodRecipes["Marinated green olives"];

test("Make recipe name", () => {
  const result = makeUniqueRecipeName(MarinatedGreenOlives, [
    "fresh red chilli",
    "garlic bulb",
    "fresh parsely",
  ]);

  expect(typeof result).toBe("string");
});

test("Combined rarity", () => {
  const result = getCombinedRarity([
    Vegetables.find((item) => item.name === "green olive"),
    Herbs.find((item) => item.name === "fresh red chilli"),
  ]);

  expect(result).toStrictEqual(109);
});

test("Find marinated green olive recipe", () => {
  const result = findRecipe("green olive");
  expect(result).toStrictEqual(MarinatedGreenOlives);
});

test("Return null for no recipe", () => {
  const result = findRecipe("not a thing");
  expect(result).toStrictEqual(null);
});

test("Find unmatched secondary ingredients with positive result", () => {
  const result = findUnmatchedSecondaryIngredients(MarinatedGreenOlives, [
    "green olive",
    "fresh parsley",
    "parsnip",
  ]);

  expect(result).toStrictEqual(["parsnip"]);
});

test("Find secondary ingredients with positive result", () => {
  const result = findSecondaryIngredients(MarinatedGreenOlives, [
    "fresh parsley",
    "garlic bulb",
    "nothing",
  ]);

  const itemsFromWorldItems = [];

  WorldItems.forEach((item) => {
    if (item.name === "fresh parsley" || item.name === "garlic bulb") {
      itemsFromWorldItems.push(item);
    }
  });

  expect(result).toStrictEqual(itemsFromWorldItems);
});

test("Find secondary ingredients with empty array result", () => {
  const result = findSecondaryIngredients(MarinatedGreenOlives, [
    "nothing1",
    "nothing2",
    "nothing3",
  ]);

  expect(result).toStrictEqual([]);
});

test("ingredients list as string is converted to array 1", () => {
  const result = getIngredientsFromCraftCommand(
    "!craft green olive + garlic bulb + fresh basil",
  );

  expect(result).toStrictEqual(["green olive", "garlic bulb", "fresh basil"]);
});

test("ingredients list as string is converted to array 2", () => {
  const result = getIngredientsFromCraftCommand(
    "!craft green olive + garlic bulb + empty plant pot + irradiated croissant + veryrareobject",
  );

  expect(result).toStrictEqual([
    "green olive",
    "garlic bulb",
    "empty plant pot",
    "irradiated croissant",
    "veryrareobject",
  ]);
});

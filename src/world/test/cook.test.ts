import { FoodRecipes } from "./../recipes/food";
import {
  findRecipe,
  findSecondaryIngredients,
  getCombinedRarity,
} from "../actions/player/cook";
import { WorldItems } from "../items/all";

const MarinatedGreenOlives = FoodRecipes["Marinated green olives"];

test("Combined rarity", () => {
  const result = getCombinedRarity(["green olive", "fresh red chilli"]);

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

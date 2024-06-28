import { getIngredientsFromCraftCommand } from "../actions/player/craft";

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

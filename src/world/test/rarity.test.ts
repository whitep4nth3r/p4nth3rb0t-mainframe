import { WorldItems } from "../items/all";

function getRarity(name) {
  return WorldItems.find((item) => item.name === name).rarity;
}

test("chicken egg returns 8", () => {
  expect(getRarity("chicken egg")).toBe(8);
});

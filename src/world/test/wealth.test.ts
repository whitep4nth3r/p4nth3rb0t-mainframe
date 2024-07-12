import {
  getWealthIndex,
  calculateDropProbabilityFromWealthIndex,
} from "../actions/wealth/wealthDistribution";

const items = [
  { _id: "mango chunk", count: 1, rarity: 4 },
  { _id: "irradiated feather", count: 1, rarity: 420 },
  { _id: "rocket salad", count: 2, rarity: 3 },
];

test("wealth index", () => {
  const result = getWealthIndex(items);
  expect(result).toStrictEqual(430);
});

test("500000 wealthIndex returns a drop probability of 1", () => {
  const result = calculateDropProbabilityFromWealthIndex(500000);
  expect(result).toStrictEqual(1);
});

test("1000 wealthIndex returns a drop probability of 1", () => {
  const result = calculateDropProbabilityFromWealthIndex(1000);
  expect(result).toStrictEqual(0);
});

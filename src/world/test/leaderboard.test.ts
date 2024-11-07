import { constructItemsForWealthIndexCalculation } from "../api/leaderboard";

const sampleReturn = [
  {
    _id: "green olive",
    count: 2,
    rarity: 1,
  },
  {
    _id: "wooden bucket",
    count: 1,
    rarity: 30,
  },
  {
    _id: "croissant",
    count: 5,
    rarity: 10,
  },
];

const sampleInput = [
  {
    _id: "123",
    name: "croissant",
    zone: "city",
    userId: "123859191",
    rarity: 10,
  },
  {
    _id: "123",
    name: "green olive",
    zone: "city",
    userId: "123859191",
    rarity: 1,
  },
  {
    _id: "123",
    name: "croissant",
    zone: "city",
    userId: "123859191",
    rarity: 10,
  },
  {
    _id: "123",
    name: "green olive",
    zone: "city",
    userId: "123859191",
    rarity: 1,
  },
  {
    _id: "123",
    name: "croissant",
    zone: "city",
    userId: "123859191",
    rarity: 10,
  },
  {
    _id: "123",
    name: "wooden bucket",
    zone: "city",
    userId: "123859191",
    rarity: 30,
  },
  {
    _id: "123",
    name: "croissant",
    zone: "city",
    userId: "123859191",
    rarity: 10,
  },
  {
    _id: "123",
    name: "croissant",
    zone: "city",
    userId: "123859191",
    rarity: 10,
  },
];

test("raw items are constructed for wealth index calc", () => {
  const returnData = constructItemsForWealthIndexCalculation(sampleInput);
  expect(returnData).toEqual(expect.arrayContaining(sampleReturn));
});

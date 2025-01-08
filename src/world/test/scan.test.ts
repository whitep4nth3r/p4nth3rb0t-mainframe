import {
  getFullItemsFromDBAggregate,
  getCountOfDbItemByName,
} from "../actions/player/scan";
import { WorldItems } from "../items/all";

const dbQueryResult = [
  { _id: "dead coral", count: 2 },
  { _id: "driftwood", count: 1 },
  { _id: "green olive", count: 1 },
  { _id: "garlic bulb", count: 1 },
  { _id: "opal", count: 1 },
];

test("Can get count of a single item from db query result by passing in a name string", () => {
  const result = getCountOfDbItemByName("dead coral", dbQueryResult);
  expect(result).toStrictEqual(2);
});

test("Can get full WorldItems array from dbQuery result", () => {
  const result = getFullItemsFromDBAggregate(dbQueryResult);

  expect(result).toEqual(
    expect.arrayContaining([
      WorldItems.find((item) => item.name === "dead coral"),
      WorldItems.find((item) => item.name === "driftwood"),
      WorldItems.find((item) => item.name === "opal"),
      WorldItems.find((item) => item.name === "green olive"),
      WorldItems.find((item) => item.name === "garlic bulb"),
    ]),
  );
});

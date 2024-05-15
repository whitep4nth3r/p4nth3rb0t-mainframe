import { getZoneBasedItemsIfPossible } from "../spawn";

test("return only swamp items when zone is swamp", () => {
  const result = getZoneBasedItemsIfPossible("swamp");
  expect(result[0].onlyZone).not.toBe(null);
});

test("return only null items when zone is not swamp", () => {
  const result = getZoneBasedItemsIfPossible("forest");
  expect(result[0].onlyZone).toBe(null);
});

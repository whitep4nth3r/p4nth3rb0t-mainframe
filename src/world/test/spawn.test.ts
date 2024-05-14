import { calculateEligibleItems } from "../spawn";

test("return onlyZone items when not null", () => {
  const result = calculateEligibleItems(10, "swamp");
  expect(result[0].onlyZone).not.toBe(null);
});

import { canMoveFromCurrentZoneToDesiredZone } from "../actions/player/move";

test("Can move from beach zone to swamp zone", () => {
  const result = canMoveFromCurrentZoneToDesiredZone("beach", "swamp");
  expect(result).toStrictEqual(true);
});

test("Cannot move from beach zone to mountain zone", () => {
  const result = canMoveFromCurrentZoneToDesiredZone("beach", "mountain");
  expect(result).toStrictEqual(false);
});

test("Cannot move from city zone to forest zone", () => {
  const result = canMoveFromCurrentZoneToDesiredZone("city", "forest");
  expect(result).toStrictEqual(false);
});

test("Can move from city zone to swamp zone", () => {
  const result = canMoveFromCurrentZoneToDesiredZone("city", "swamp");
  expect(result).toStrictEqual(true);
});
test("Cannot move from forest zone to city zone", () => {
  const result = canMoveFromCurrentZoneToDesiredZone("forest", "city");
  expect(result).toStrictEqual(false);
});

test("Can move from forest zone to mountain zone", () => {
  const result = canMoveFromCurrentZoneToDesiredZone("forest", "mountain");
  expect(result).toStrictEqual(true);
});

test("Can move from mountain zone to forest zone", () => {
  const result = canMoveFromCurrentZoneToDesiredZone("mountain", "forest");
  expect(result).toStrictEqual(true);
});

test("Cannot move from mountain zone to beach zone", () => {
  const result = canMoveFromCurrentZoneToDesiredZone("mountain", "beach");
  expect(result).toStrictEqual(false);
});
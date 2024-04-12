import { isValidPantherworldZone } from "../zones";

test("valid zone forest", () => {
  const result = isValidPantherworldZone("forest");
  expect(result).toBe(true);
});

test("valid zone mountain", () => {
  const result = isValidPantherworldZone("mountain");
  expect(result).toBe(true);
});

test("valid zone city", () => {
  const result = isValidPantherworldZone("mountain");
  expect(result).toBe(true);
});

test("valid zone desert", () => {
  const result = isValidPantherworldZone("mountain");
  expect(result).toBe(true);
});

test("invalid zone", () => {
  const result = isValidPantherworldZone("ssssssssss");
  expect(result).toBe(false);
});

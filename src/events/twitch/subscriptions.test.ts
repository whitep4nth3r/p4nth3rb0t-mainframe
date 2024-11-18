import { checkGiftSubReceipientUsername } from "./subscriptions";

test("checkGiftSubReceipientUsername filters out trump", () => {
  expect(checkGiftSubReceipientUsername("trump")).toBe(false);
});

test("checkGiftSubReceipientUsername filters out something_else_trump_something", () => {
  expect(checkGiftSubReceipientUsername("trump")).toBe(false);
});

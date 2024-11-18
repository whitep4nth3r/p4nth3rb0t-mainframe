import { checkGiftSubRecipientUsername } from "./subscriptions";

test("checkGiftSubReceipientUsername filters out trump", () => {
  expect(checkGiftSubRecipientUsername("trump")).toBe(false);
});

test("checkGiftSubReceipientUsername filters out something_else_trump_something", () => {
  expect(checkGiftSubRecipientUsername("trump")).toBe(false);
});

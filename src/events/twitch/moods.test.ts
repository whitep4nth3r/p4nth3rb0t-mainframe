import Moods from "./moods";

test("Set + get current mood", () => {
  Moods.setCurrentMood("cool");
  expect(Moods.getCurrentMood()).toBe("cool");
});

test("Get random mood returns a value that is not current mood", () => {
  Moods.setCurrentMood("cool");
  expect(Moods.getRandomNewMood()).not.toBe("cool");
});

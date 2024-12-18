import { messageContainsCode } from "./messageContainsCode";

test("if message contains open { and close }", () => {
  const result = messageContainsCode("function() { do this thing }");
  expect(result).toBe(true);
});

test("if message contains normal words but they might be code", () => {
  const result = messageContainsCode("let me help you with that");
  expect(result).toBe(false);
});

test("this.getParentClass() = null", () => {
  const result = messageContainsCode("this.getParentClass() = null");
  expect(result).toBe(true);
});

test("this specific false positive from Kodder", () => {
  const result = messageContainsCode(
    "I used to get phone calls for international calls credit or what ever they are called for middle eastern countries back when I lived in Montreal",
  );
  expect(result).toBe(false);
});

test("if message contains 3 backticks", () => {
  const result = messageContainsCode("```");
  expect(result).toBe(true);
});

test("if message contains [object Object]", () => {
  const result = messageContainsCode("[object Object]");
  expect(result).toBe(true);
});

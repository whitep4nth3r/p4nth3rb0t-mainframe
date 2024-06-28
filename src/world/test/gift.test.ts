import { getRandPlayerInSameZoneFromCurrentChatters } from "../actions/player/gift";

const currentChatters = [{ user_id: "123" }, { user_id: "456" }];

const diffCurrentChatters = [{ user_id: "000" }, { user_id: "111" }];

const players = [{ userId: "123" }, { userId: "789" }];

const foundPlayer = { userId: "123" };

test("player in current chatters is returned", () => {
  const result = getRandPlayerInSameZoneFromCurrentChatters(
    currentChatters,
    players,
  );

  expect(result).toStrictEqual(foundPlayer);
});

test("no players from DB query are currently in the chat returns null", () => {
  const result = getRandPlayerInSameZoneFromCurrentChatters(
    diffCurrentChatters,
    players,
  );

  expect(result).toBe(null);
});

test("null return value if current chatters length is zero", () => {
  const result = getRandPlayerInSameZoneFromCurrentChatters([], players);

  expect(result).toBe(null);
});

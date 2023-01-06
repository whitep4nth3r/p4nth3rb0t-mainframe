import WebSocketServer from "../../WebSocketServer";
import { tmi } from "../../tmi";
import { Userstate } from "tmi.js";
import UserManager from "../../users/UserManager";
import { MainframeEvent, SubPacket } from "@whitep4nth3r/p4nth3rb0t-types";
import Moods, { sendMoodChangeEvent } from "./moods";
import { config } from "../../config";

export const sendSubEvent = async (
  userId: string,
  username: string,
  messageId: string,
  message: string,
  subTier: string,
  isGift = false,
  months = 0,
): Promise<void> => {
  try {
    const user = await UserManager.getUserById(userId as string);
    const giftRecipient = isGift
      ? await UserManager.getUserByLogin(username)
      : undefined;

    if (user) {
      const logoUrl =
        giftRecipient !== undefined
          ? giftRecipient.profile_image_url
          : user.profile_image_url;

      const subEvent: SubPacket = {
        event: MainframeEvent.sub,
        id: messageId,
        data: {
          logoUrl,
          subscriberUsername: username,
          subTier,
          message,
          months,
        },
      };

      WebSocketServer.sendData(subEvent);

      setTimeout(async () => {
        const newRandomMood: string = Moods.getRandomNewMood();
        await sendMoodChangeEvent(newRandomMood, Date.now().toString());
        tmi.say(
          config.channel,
          `/announce p4nth3rPEWPEW Thank you for your subscription to p4nth3rworld, @${username}! p4nth3rPEWPEW`,
        );
      }, 3500);
    }
  } catch (error) {
    console.log(error);
  }
};

/**
 * Untested!
 */

// tmi.on(
//   "anongiftpaidupgrade",
//   (
//     channel: string,
//     username: string,
//     methods: {},
//     message: string,
//     userstate: Userstate,
//   ) => {
//     sendSubEvent(
//       userstate["user-id"] as string,
//       userstate["display-name"] as string,
//       userstate["id"] as string,
//       message,
//       userstate["msg-param-sub-plan"] === "Prime"
//         ? "Prime"
//         : (userstate["msg-param-sub-plan"] / 1000).toString(),
//     );
//   },
// );

/**
 * Untested!
 */

// tmi.on(
//   "giftpaidupgrade",
//   (
//     channel: string,
//     username: string,
//     methods: {},
//     message: string,
//     userstate: Userstate,
//   ) => {
//     sendSubEvent(
//       userstate["user-id"] as string,
//       userstate["display-name"] as string,
//       userstate["id"] as string,
//       message,
//       userstate["msg-param-sub-plan"] === "Prime"
//         ? "Prime"
//         : (userstate["msg-param-sub-plan"] / 1000).toString(),
//     );
//   },
// );

tmi.on(
  "subgift",
  (
    channel: string,
    username: string,
    streakMonths: number,
    recipient: string,
    methods: Record<string, unknown>,
    userstate: Userstate,
  ) => {
    if (!config.FREEZE_MODE) {
      sendSubEvent(
        userstate["user-id"] as string,
        userstate["msg-param-recipient-user-name"],
        userstate["id"] as string,
        "",
        userstate["msg-param-sub-plan"] === "Prime"
          ? "Prime"
          : (userstate["msg-param-sub-plan"] / 1000).toString(),
        true,
      );
    }
  },
);

tmi.on(
  "subscription",
  (
    channel: string,
    username: string,
    methods: Record<string, unknown>,
    message: string,
    userstate: Userstate,
  ) => {
    if (!config.FREEZE_MODE) {
      sendSubEvent(
        userstate["user-id"] as string,
        userstate["display-name"] as string,
        userstate["id"] as string,
        message,
        userstate["msg-param-sub-plan"] === "Prime"
          ? "Prime"
          : (userstate["msg-param-sub-plan"] / 1000).toString(),
      );
    }
  },
);

tmi.on(
  "resub",
  (
    channel: string,
    username: string,
    months: number,
    message: string,
    userstate: Userstate,
    methods: Record<string, unknown>,
  ) => {
    if (!config.FREEZE_MODE) {
      sendSubEvent(
        userstate["user-id"] as string,
        userstate["display-name"] as string,
        userstate["id"] as string,
        message,
        userstate["msg-param-sub-plan"] === "Prime"
          ? "Prime"
          : (userstate["msg-param-sub-plan"] / 1000).toString(),
        false,
        months,
      );
    }
  },
);

import * as Sentry from "@sentry/node";
import WebSocketServer from "../../WebSocketServer";
import { tmi } from "../../tmi";
import { SubGiftUserstate, SubUserstate } from "tmi.js";
import UserManager from "../../users/UserManager";
import { MainframeEvent, SubPacket } from "@whitep4nth3r/p4nth3rb0t-types";
import Moods, { sendMoodChangeEvent } from "./moods";
import { config } from "../../config";
import { SpawnEventType, spawn } from "../../world/spawn";

const getSubPlan = (subPlan: string | undefined): string => {
  if (subPlan === "Prime") {
    return "Prime";
  }

  if (subPlan) {
    return (parseInt(subPlan) / 1000).toString();
  }

  return "Unknown";
};

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
      }, 3500);
    }
  } catch (error) {
    Sentry.captureException(error);
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
  async (
    channel: string,
    username: string,
    streakMonths: number,
    recipient: string,
    methods: Record<string, unknown>,
    userstate: SubGiftUserstate,
  ) => {
    const recipientUserName = userstate["msg-param-recipient-user-name"];

    if (!config.FREEZE_MODE) {
      if (typeof recipientUserName === "string") {
        await spawn({
          type: SpawnEventType.Sub,
          data: { username: recipientUserName },
        });
        await sendSubEvent(
          userstate["user-id"] as string,
          recipientUserName,
          userstate["id"] as string,
          "",
          getSubPlan(userstate["msg-param-sub-plan"]),
          true,
        );
      }
    }
  },
);

tmi.on(
  "subscription",
  async (
    channel: string,
    username: string,
    methods: Record<string, unknown>,
    message: string,
    userstate: SubUserstate,
  ) => {
    if (!config.FREEZE_MODE) {
      await spawn({
        type: SpawnEventType.Sub,
        data: { username: userstate["display-name"] as string },
      });

      await sendSubEvent(
        userstate["user-id"] as string,
        userstate["display-name"] as string,
        userstate["id"] as string,
        message,
        getSubPlan(userstate["msg-param-sub-plan"]),
      );
    }
  },
);

tmi.on(
  "resub",
  async (
    channel: string,
    username: string,
    months: number,
    message: string,
    userstate: SubUserstate,
    // methods: Record<string, unknown>,
  ) => {
    if (!config.FREEZE_MODE) {
      const doubleUsername =
        userstate["display-name"] + userstate["display-name"];
      await spawn({
        type: SpawnEventType.Sub,
        data: { username: doubleUsername },
      });
      await sendSubEvent(
        userstate["user-id"] as string,
        userstate["display-name"] as string,
        userstate["id"] as string,
        message,
        getSubPlan(userstate["msg-param-sub-plan"]),
        false,
        months,
      );
    }
  },
);

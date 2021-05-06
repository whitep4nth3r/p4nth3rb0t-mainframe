import { testConfig } from "./../../testConfig";
import WebSocketServer from "../WebSocketServer";
import { tmi } from "./../tmi";
import { Userstate } from "tmi.js";
import UserManager from "../users/UserManager";
import { MainframeEvent, SubPacket } from "@whitep4nth3r/p4nth3rb0t-types";

export const sendSubEvent = async (
  userId: string,
  username: string,
  messageId: string,
  message: string,
  subTier: string,
  isGift: boolean = false,
  months: number = 0,
) => {
  try {
    const user = await UserManager.getUserById(userId as string);
    const giftRecipient = isGift
      ? await UserManager.getUserByLogin(username)
      : null;

    const logoUrl =
      giftRecipient !== null ? giftRecipient.users[0].logo : user.logo;

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
  } catch (error) {
    console.log(error);
  }
};

//TODO ADD MYSTERY GIFT?
//According to tmijs docs that is what is happening.
//Subgif is a gift to someone directly as in 1:1,
//where as mysterygift can be 1:N number of gifts given

// tmi.on(
//   "anongiftpaidupgrade",
//   (channel: string, username: string, userstate: Userstate) => {
//     sendGiftSubEvent(
//       userstate["user-id"] as string,
//       userstate["id"] as string,
//       userstate["msg-param-recipient-user-name"],
//       "subtier",
//     );
//   },
// );

// tmi.on(
//   "giftpaidupgrade",
//   (channel: string, username: string, sender: string, userstate: Userstate) => {
//     sendGiftSubEvent(
//       userstate["user-id"] as string,
//       userstate["id"] as string,
//       userstate["msg-param-recipient-user-name"],
//       "subtier",
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
    methods: {},
    userstate: Userstate,
  ) => {
    testConfig.connectToFdgt
      ? sendSubEvent(
          testConfig.userId,
          testConfig.username,
          testConfig.userId,
          "this is a test message",
          "1",
          true,
        )
      : sendSubEvent(
          userstate["user-id"] as string,
          userstate["msg-param-recipient-user-name"],
          userstate["id"] as string,
          "",
          userstate["msg-param-sub-plan"] === "Prime"
            ? "Prime"
            : (userstate["msg-param-sub-plan"] / 1000).toString(),
          true,
        );
  },
);

tmi.on(
  "subscription",
  (
    channel: string,
    username: string,
    methods: {},
    message: string,
    userstate: Userstate,
  ) => {
    testConfig.connectToFdgt
      ? sendSubEvent(
          testConfig.userId,
          testConfig.username,
          testConfig.userId,
          "test message",
          "1",
        )
      : sendSubEvent(
          userstate["user-id"] as string,
          userstate["display-name"] as string,
          userstate["id"] as string,
          message,
          userstate["msg-param-sub-plan"] === "Prime"
            ? "Prime"
            : (userstate["msg-param-sub-plan"] / 1000).toString(),
        );
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
    methods: {},
  ) => {
    console.log("resub", userstate);
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
  },
);

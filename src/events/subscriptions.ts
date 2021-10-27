import WebSocketServer from "../WebSocketServer";
import {tmi} from "../tmi";
import {Userstate} from "tmi.js";
import UserManager from "../users/UserManager";
import {MainframeEvent, SubPacket} from "@whitep4nth3r/p4nth3rb0t-types";
import {config} from "../config";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sendSubEvent = async (
    userId: string, username: string, messageId: string, message: string,
    subTier: string, isGift = false, months = 0) => {
    try {
        const user = await UserManager.getUserById(userId as string);
        const giftRecipient = isGift ? await UserManager.getUserByLogin(username) : undefined;

        if (user) {
            const logoUrl = giftRecipient !== undefined ? giftRecipient.profile_image_url : user.profile_image_url;

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

// eslint-disable-next-line @typescript-eslint/ban-types
tmi.on("subgift", (channel: string, username: string, streakMonths: number, recipient: string, methods: {}, userstate: Userstate) => {
    if (!config.FREEZE_MODE) {
        sendSubEvent(
            userstate["user-id"] as string, userstate["msg-param-recipient-user-name"], userstate["id"] as string,
            "",
            userstate["msg-param-sub-plan"] === "Prime" ? "Prime" : (userstate["msg-param-sub-plan"] / 1000).toString(),
            true,
        ).then(() => {
            return true;
        });
    }
});

// eslint-disable-next-line @typescript-eslint/ban-types
tmi.on("subscription", (channel: string, username: string, methods: {}, message: string, userstate: Userstate) => {
    if (!config.FREEZE_MODE) {
        sendSubEvent(
            userstate["user-id"] as string, userstate["display-name"] as string, userstate["id"] as string, message,
            userstate["msg-param-sub-plan"] === "Prime" ? "Prime" : (userstate["msg-param-sub-plan"] / 1000).toString(),
        ).then(() => {
            return true;
        });
    }
});

// eslint-disable-next-line @typescript-eslint/ban-types
tmi.on("resub", (channel: string, username: string, months: number, message: string, userstate: Userstate, methods: {}) => {
    if (!config.FREEZE_MODE) {
        sendSubEvent(userstate["user-id"] as string, userstate["display-name"] as string, userstate["id"] as string, message,
            userstate["msg-param-sub-plan"] === "Prime" ? "Prime" : (userstate["msg-param-sub-plan"] / 1000).toString(),
            false,
            months,
        ).then(() => {
            return true;
        });
    }
});

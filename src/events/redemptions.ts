import {tmi} from "../tmi";
import {ChatUserstate} from "tmi.js";
import {config} from "../config";
import {
    NumeronymPacket,
    MainframeEvent,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const sendNumeronymEvent = async (isActive: boolean) => {
    try {
        const numeronymEvent: NumeronymPacket = {
            event: MainframeEvent.numeronym,
            id: Math.random().toString(),
            data: {
                isActive,
            },
        };

        WebSocketServer.sendData(numeronymEvent);
    } catch (error) {
        console.log(error);
    }
};

tmi.on("message", async (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
    const rewardId: string = tags["custom-reward-id"];

    if (!config.FREEZE_MODE) {
        if (Object.keys(config.channelRedemptions).includes(rewardId)) {
            switch (config.channelRedemptions[rewardId]) {
                case "numeronym":
                    sendNumeronymEvent(true);

                    setTimeout(async () => {
                        sendNumeronymEvent(false);
                    }, 300000);
                break;
                default:
                    return null;
            }
        }
    }
});

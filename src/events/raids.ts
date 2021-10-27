import {tmi} from "../tmi";
import WebSocketServer from "../WebSocketServer";
import {config} from "../config";
import UserManager from "../users/UserManager";
import {MainframeEvent, RaidPacket} from "@whitep4nth3r/p4nth3rb0t-types";
import {sendTimerEvent} from "./timer";
import {sendShoutoutEvent} from "./shoutout";

const getRaidShoutout = (username: string, viewers: number): string => {
    return `Welcome to ${viewers} raiders! Thank you for the raid @${username}! Check out their channel at https://twitch.tv/${username}`;
};

const sendRaidEvent = async (raiderCount: number, username: string) => {
    await sendTimerEvent(5, "follower-only chat disabled");

    const user = await UserManager.getUserByLogin(username);

    if (user) {
        try {
            const raidEvent: RaidPacket = {
                event: MainframeEvent.raid,
                id: username + "-" + raiderCount,
                data: {
                    raiderCount: raiderCount,
                    raider: username,
                    logoUrl: user.profile_image_url,
                },
            };

            WebSocketServer.sendData(raidEvent);

            setTimeout(async () => {
                await sendShoutoutEvent(user.id, `!so ${user.login}`);
            }, 7000);

            setTimeout(() => {
                tmi.say(config.channel, "Engaging followers only chat!");
                tmi.say(config.channel, "/followers 0");
            }, 300000);
        } catch (error) {
            console.log(error);
        }
    }
};

tmi.on("raided", (channel: string, username: string, viewers: number) => {
    if (!config.FREEZE_MODE) {
        tmi.say(config.channel, getRaidShoutout(username, viewers));
        sendRaidEvent(viewers, username).then(() => {
            return true;
        });
        tmi.say(config.channel, "Disengaging followers only chat! Welcome in everyone!");
        tmi.say(config.channel, "/followersoff");
    }
});

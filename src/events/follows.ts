import {tmi} from "../tmi";
import WebsocketServer from "../WebSocketServer";
import {config} from "../config";
import UserManager from "../users/UserManager";
import TwitchFollowerModel from "../data/models/TwitchFollower";
import {getActiveBroadcasterStreamByBroadcasterId} from "../utils/twitchUtils";
import {FollowPacket, MainframeEvent} from "@whitep4nth3r/p4nth3rb0t-types";

export const sendBroadcasterFollowEvent = async (followerName: string, followerUserId: string) => {
    const existingFollower = await TwitchFollowerModel.findOne({
        userId: followerUserId,
    });

    if (!existingFollower) {
        console.log("🚨 NEW FOLLOWER DETECTED! 🚨");

        //TODO: cache this
        const broadcasterStream = await getActiveBroadcasterStreamByBroadcasterId(config.broadcaster.user_id);

        if (broadcasterStream) {
            const user = await UserManager.getUserById(followerUserId as string);

            if (user) {
                console.log(`🚨 ${user.login} is now following 🚨`);
                try {
                    if (!config.FREEZE_MODE) {
                        const broadcasterFollowEvent: FollowPacket = {
                            event: MainframeEvent.follow,
                            id: followerName + "-" + Date.now(),
                            data: {
                                followerName,
                                followerUserId,
                                logoUrl: user.profile_image_url,
                            },
                        };

                        WebsocketServer.sendData(broadcasterFollowEvent);

                        setTimeout(async () => {
                            // Announce with p4nth3rb0t
                            await tmi.say(config.channel, `Thanks for the follow @${followerName}!`);
                        }, 3500);
                    }

                    await TwitchFollowerModel.updateOne(
                        {userId: followerUserId},
                        {
                            userId: followerUserId,
                            userDisplayName: followerName,
                            streamId: broadcasterStream.id,
                            logoUrl: user.profile_image_url,
                        },
                        {upsert: true},
                    );
                } catch (error) {
                    console.log(error);
                }
            }
        }
    }
};

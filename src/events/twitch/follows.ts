import { FullTwitchUser, TwitchAnnouncementColor } from "./../../data/types";
import * as Sentry from "@sentry/node";
import WebsocketServer from "../../WebSocketServer";
import { config } from "../../config";
import UserManager from "../../users/UserManager";
import TwitchFollowerModel from "../../data/models/TwitchFollower";
import { announce } from "../../utils/twitchUtils";
import { FollowPacket, MainframeEvent } from "@whitep4nth3r/p4nth3rb0t-types";
import Moods, { sendMoodChangeEvent } from "./moods";
import { SpawnEventType, spawn } from "../../world/spawn";

export const sendBroadcasterFollowEvent = async (
  followerName: string,
  followerUserId: string,
) => {
  const existingFollower = await TwitchFollowerModel.findOne({
    userId: followerUserId,
  });

  if (existingFollower) {
    console.log(
      `🚨 EXISTING FOLLOWER ${existingFollower.userDisplayName} DETECTED! 🚨`,
    );
  }

  if (!existingFollower) {
    console.log(`🚨 NEW FOLLOWER ${followerName} DETECTED! 🚨`);

    await spawn({
      type: SpawnEventType.Follow,
      data: { username: followerName },
    });

    const user: FullTwitchUser = await UserManager.getUserById(
      followerUserId as string,
    );

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
            // Send random mood change
            const newRandomMood: string = Moods.getRandomNewMood();
            await sendMoodChangeEvent(
              newRandomMood,
              followerName + "-" + Date.now(),
            );

            // const randomZone = getRandomEntry(PantherworldZones);
            // await movePlayer(user.id, randomZone.name, false);

            await announce(
              `🌍 Welcome to p4nth3rworld, @${followerName}!`,
              TwitchAnnouncementColor.Green,
            );
          }, 3500);
        }

        await TwitchFollowerModel.updateOne(
          { userId: followerUserId },
          {
            userId: followerUserId,
            userDisplayName: followerName,
          },
          { upsert: true },
        );
      } catch (error) {
        Sentry.captureException(error);
      }
    }
  }
};

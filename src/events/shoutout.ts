import { tmi } from "../tmi";
import { config } from "../config";
import { getRestOfMessage } from "../utils/commands";
import UserManager from "../users/UserManager";
import {TwitchChannel} from "../data/types";
import {
  MainframeEvent,
  ShoutOutPacket,
  ShoutOutData,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";

export const sendShoutoutEvent = async (messageId: string, message: string) => {
  const possibleUsername: string[] = getRestOfMessage(message);

  try {
    const user = await UserManager.getUserByLogin(possibleUsername[0]);

    if (user) {
      const channel: TwitchChannel | undefined = await UserManager.getChannelById(user.id);

      if (channel) {
        tmi.say(config.channel, `Shouting out ${user.display_name}! See more of them at https://www.twitch.tv/${user.login}!`);

        const dataToSend: ShoutOutData = {
          lastStream: {
            title: channel.title,
            category: channel.game_name,
          },
          logoUrl: user.profile_image_url,
          username: user.display_name,
        };

        const shoutOutEvent: ShoutOutPacket = {
          event: MainframeEvent.shoutOut,
          id: messageId,
          data: dataToSend,
        };

        WebSocketServer.sendData(shoutOutEvent);
      }
    }
  } catch (error) {}
};

import { tmi } from "./../tmi";
import { config } from "../config";
import { getRestOfMessage } from "../utils/commands";
import UserManager from "../users/UserManager";
import { TwitchChannel } from "../data/types";
import {
  MainframeEvent,
  ShoutOutPacket,
  ShoutOutData,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";
import Team from "../users/Team";

export const sendShoutoutEvent = async (messageId: string, message: string) => {
  const possibleUsername: string[] = getRestOfMessage(message);

  try {
    const userResponse = await UserManager.getUserByLogin(possibleUsername[0]);

    if (userResponse) {
      const channel: TwitchChannel | undefined = await Team.getChannelById(
        userResponse.data[0].id,
      );

      if (channel) {
        tmi.say(
          config.channel,
          `p4nth3rPEWPEW Go check out ${userResponse.data[0].display_name} at https://www.twitch.tv/${userResponse.data[0].login} and give them some panther PEW PEWS! They were last seen streaming: ${channel.title} in ${channel.game_name} p4nth3rPEWPEW`,
        );

        const dataToSend: ShoutOutData = {
          lastStream: {
            title: channel.title,
            category: channel.game_name,
          },
          logoUrl: userResponse.data[0].profile_image_url,
          username: userResponse.data[0].display_name,
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

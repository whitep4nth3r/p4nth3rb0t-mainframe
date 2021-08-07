import { tmi } from "./../tmi";
import { config } from "../config";
import { ChatUserstate } from "tmi.js";
import { UserByLoginResponse } from "../data/types";
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
    const user: UserByLoginResponse = await UserManager.getUserByLogin(
      possibleUsername[0],
    );

    if (user) {
      const channel: TwitchChannel | undefined = await Team.getChannelById(
        user.users[0]._id,
      );

      if (channel) {
        tmi.say(
          config.channel,
          `whitep30PEWPEW Go check out ${user.users[0].display_name} at https://www.twitch.tv/${user.users[0].name} and give them some panther PEW PEWS! They were last seen streaming: ${channel.title} in ${channel.game_name} whitep30PEWPEW`,
        );

        const dataToSend: ShoutOutData = {
          lastStream: {
            title: channel.title,
            category: channel.game_name,
          },
          logoUrl: user.users[0].logo,
          username: user.users[0].display_name,
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

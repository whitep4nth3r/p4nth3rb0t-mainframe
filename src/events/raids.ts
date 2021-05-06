import { tmi } from "./../tmi";
import WebSocketServer from "../WebSocketServer";
import { config } from "../config";
import UserManager from "../users/UserManager";
import { MainframeEvent, RaidPacket } from "@whitep4nth3r/p4nth3rb0t-types";

const getRaidShoutout = (username: string, viewers: number): string => {
  return `whitep30PEWPEW Welcome to ${viewers} raiders! Thank you for the raid @${username}! Check out their channel at https://twitch.tv/${username} whitep30PEWPEW`;
};

const sendRaidEvent = async (raiderCount: number, username: string) => {
  const user = await UserManager.getUserByLogin(username as string);

  try {
    const raidEvent: RaidPacket = {
      event: MainframeEvent.raid,
      id: username + "-" + raiderCount,
      data: {
        raiderCount: raiderCount,
        raider: username,
        logoUrl: user.users[0].logo,
      },
    };

    WebSocketServer.sendData(raidEvent);
  } catch (error) {
    console.log(error);
  }
};

tmi.on("raided", (channel: string, username: string, viewers: number) => {
  tmi.say(config.channel, getRaidShoutout(username, viewers));
  sendRaidEvent(viewers, username);
});

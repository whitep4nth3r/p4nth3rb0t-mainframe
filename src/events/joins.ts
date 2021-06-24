import { tmi } from "../tmi";
import WebSocketServer from "../WebSocketServer";
import { config } from "../config";
import {
  MainframeEvent,
  SpecialUserJoinPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";

const sendSpecialUserJoinEvent = async (username: string) => {
  try {
    const specialUserJoin: SpecialUserJoinPacket = {
      event: MainframeEvent.specialUserJoin,
      id: username + "-" + Date.now(),
      data: {
        username: username,
      },
    };

    WebSocketServer.sendData(specialUserJoin);
  } catch (error) {
    console.log(error);
  }
};

tmi.on("join", async (channel: string, username: string, self: boolean) => {
  if (config.specialUsers.includes(username.toLowerCase())) {
    sendSpecialUserJoinEvent(username.toLowerCase());
  }
});

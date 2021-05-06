import { tmi } from "../tmi";
import { ChatUserstate } from "tmi.js";
import { config } from "../config";
import WebSocketServer from "../WebSocketServer";
import { MerchPacket, MainframeEvent } from "@whitep4nth3r/p4nth3rb0t-types";

export const sendMerchEvent = async (messageId: string) => {
  try {
    const merchEvent: MerchPacket = {
      event: MainframeEvent.merch,
      id: messageId,
      data: {},
    };

    WebSocketServer.sendData(merchEvent);
  } catch (error) {
    console.log(error);
  }
};

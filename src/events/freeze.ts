import { FreezePacket, MainframeEvent } from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";

export const sendFreezeEvent = async () => {
  try {
    const freezeEvent: FreezePacket = {
      event: MainframeEvent.freeze,
      id: "freeze",
      data: {},
    };

    WebSocketServer.sendData(freezeEvent);
  } catch (error) {
    console.log(error);
  }
};

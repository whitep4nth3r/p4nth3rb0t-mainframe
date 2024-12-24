import * as Sentry from "@sentry/node";
import WebSocketServer from "../../classes/WebSocketServer";
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
    Sentry.captureException(error);
  }
};

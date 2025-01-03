import * as Sentry from "@sentry/node";
import WebSocketServer from "../../classes/WebSocketServer";
import {
  MainframeEvent,
  HypeTrainBeginPacket,
  HypeTrainProgressPacket,
  HypeTrainEndPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";

export async function sendHypeTrainBeginEvent(level: number): Promise<void> {
  try {
    const hypeTrainBeginPacket: HypeTrainBeginPacket = {
      event: MainframeEvent.hypeTrainBegin,
      id: `hype-${Date.now()}`,
      data: {
        level,
      },
    };

    WebSocketServer.sendData(hypeTrainBeginPacket);
  } catch (error) {
    Sentry.captureException(error);
  }
}

export async function sendHypeTrainProgressEvent(level: number): Promise<void> {
  try {
    const hypeTrainProgressPacket: HypeTrainProgressPacket = {
      event: MainframeEvent.hypeTrainProgress,
      id: `hype-${Date.now()}`,
      data: {
        level,
      },
    };

    WebSocketServer.sendData(hypeTrainProgressPacket);
  } catch (error) {
    Sentry.captureException(error);
  }
}

export async function sendHypeTrainEndEvent(level: number): Promise<void> {
  try {
    const hypeTrainEndPacket: HypeTrainEndPacket = {
      event: MainframeEvent.hypeTrainEnd,
      id: `hype-${Date.now()}`,
      data: {
        level,
      },
    };

    WebSocketServer.sendData(hypeTrainEndPacket);
  } catch (error) {
    Sentry.captureException(error);
  }
}

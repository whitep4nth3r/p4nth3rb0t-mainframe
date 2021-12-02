import { TimerPacket, MainframeEvent } from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";

export const sendTimerEvent = async (minutes: number, description: string) => {
  try {
    const timerEvent: TimerPacket = {
      event: MainframeEvent.timer,
      id: `timer-${Date.now()}`,
      data: {
        minutes,
        description,
      },
    };

    WebSocketServer.sendData(timerEvent);
  } catch (error) {
    console.log(error);
  }
};

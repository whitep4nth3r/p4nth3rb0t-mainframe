import WebSocketServer from "../../WebSocketServer";
import { MainframeEvent, SpecialPacket } from "@whitep4nth3r/p4nth3rb0t-types";
import { sendMoodChangeEvent } from "./moods";

export const sendSpecialEvent = async (data: unknown): Promise<void> => {
  const id = new Date().toString();
  try {
    const specialEvent: SpecialPacket = {
      event: MainframeEvent.special,
      id,
      data,
    };

    WebSocketServer.sendData(specialEvent);

    setTimeout(async () => {
      await sendMoodChangeEvent("hype", id);
    }, 3500);
  } catch (error) {
    console.log(error);
  }
};

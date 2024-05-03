import PantherworldItemModel from "../data/models/PantherworldItem";
import { tmi } from "./../tmi";
import { config } from "../config";
import { sendPantherworldFeedEvent } from "../discord";
import { WorldState } from "./state";
import { getRandomEntry } from "../utils/getRandomEntry";
import { PantherworldZones } from "./zones";
import WebsocketServer from "../WebSocketServer";
import {
  MainframeEvent,
  ReleaseUnclaimedPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

export async function releaseUnclaimed(): Promise<void> {
  const randomZone = getRandomEntry(PantherworldZones);

  const unclaimed = await PantherworldItemModel.find({
    userId: null,
    zone: randomZone.name,
  });

  if (unclaimed.length === 0) {
    const message = `${botPrefix}🪹 There are no unclaimed items in the ${randomZone.name} zone!`;

    tmi.say(config.channel, message);
    await sendPantherworldFeedEvent(message);
  } else {
    WorldState.ITEMS_RELEASED = true;

    const itemList = unclaimed.map((item) => item.name).join(", ");

    const message = `${botPrefix}📦 World items released in the ${randomZone.name} zone! Items available: ${itemList}`;

    tmi.say(config.channel, message);
    await sendPantherworldFeedEvent(message);

    const releaseUnclaimedEvent: ReleaseUnclaimedPacket = {
      event: MainframeEvent.releaseUnclaimed,
      id: randomZone.name + "-" + Date.now(),
      type: "release",
      data: {
        count: unclaimed.length,
        zone: randomZone.name,
      },
    };

    WebsocketServer.sendData(releaseUnclaimedEvent);

    setTimeout(async () => {
      WorldState.ITEMS_RELEASED = false;
      tmi.say(config.channel, `${botPrefix}🔒 All items locked!`);
      await sendPantherworldFeedEvent("🔒 All items locked!");
    }, 60000);
  }
}

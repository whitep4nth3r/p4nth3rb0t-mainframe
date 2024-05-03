import PantherworldItemModel from "../data/models/PantherworldItem";
import { tmi } from "./../tmi";
import { config } from "../config";
import { sendPantherworldFeedEvent } from "../discord";
import { WorldState } from "./state";
import { getRandomEntry } from "../utils/getRandomEntry";
import { PantherworldZones } from "./zones";

const botPrefix = process.env.NODE_ENV === "development" ? "DEV: " : "";

export async function releaseUnclaimed(): Promise<void> {
  const randomZone = getRandomEntry(PantherworldZones);

  const unclaimed = await PantherworldItemModel.find({
    userId: null,
    zone: randomZone.name,
  });

  if (unclaimed.length === 0) {
    const message = `${botPrefix}🪹 There are no unclaimed items in the ${randomZone.name} zone!!`;

    tmi.say(config.channel, message);

    await sendPantherworldFeedEvent(message);
    return;
  } else {
    WorldState.ITEMS_RELEASED = true;

    const itemList = unclaimed.map((item) => item.name).join(", ");

    const message = `${botPrefix}🔒 World items released in the ${randomZone.name} zone! Items available: ${itemList}`;

    tmi.say(config.channel, message);

    await sendPantherworldFeedEvent(message);

    setTimeout(async () => {
      WorldState.ITEMS_RELEASED = false;
      tmi.say(config.channel, `${botPrefix}🔒 All items locked!`);
      await sendPantherworldFeedEvent("🔒 All items locked!");
    }, 60000);
  }
}

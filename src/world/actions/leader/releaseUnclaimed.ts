import PantherworldItemModel from "../../../data/models/PantherworldItem";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import { sendPantherworldFeedEvent } from "../../../discord";
import { WorldState } from "../../state";
import { getRandomEntry } from "../../../utils/getRandomEntry";
import { PantherworldZones } from "../../zones";
import WebsocketServer from "../../../WebSocketServer";
import {
  MainframeEvent,
  ReleaseUnclaimedPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { PantherworldEvent } from "../../api/types";

export async function releaseUnclaimed(zoneName?: string): Promise<void> {
  const randomZone =
    zoneName !== undefined
      ? PantherworldZones.find((fullZone) => fullZone.name === zoneName)
      : getRandomEntry(PantherworldZones);

  const unclaimed = await PantherworldItemModel.aggregate([
    // Match documents with a null userId and random zone name
    { $match: { userId: null, zone: randomZone.name } },

    // Group documents by name, count the number of items in each group
    { $group: { _id: "$name", count: { $sum: 1 } } },

    // Sort the groups by count in descending order
    { $sort: { count: -1 } },
  ]);

  if (unclaimed.length === 0) {
    const message = `${config.BOT_PREFIX}🪹 There are no unclaimed items in the ${randomZone.name} zone!`;

    tmi.say(config.channel, message);
  } else {
    WorldState.ITEMS_RELEASED = true;
    WorldState.RELEASE_ZONE = randomZone.name;

    const itemList = unclaimed
      .map((item) => `${item.count} ${item._id}`)
      .join(", ");

    const message = `World items released in the ${randomZone.name} zone! Items available: ${itemList}`;

    tmi.say(config.channel, `${config.BOT_PREFIX}📦 ${message}`);

    await sendPantherworldFeedEvent(
      message,
      PantherworldEvent.RELEASE,
      config.BOT_PREFIX,
    );

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
      WorldState.RELEASE_ZONE = null;
      const message = `All items locked!`;
      tmi.say(config.channel, `${config.BOT_PREFIX}🔒 ${message}`);

      await sendPantherworldFeedEvent(
        message,
        PantherworldEvent.LOCK,
        config.BOT_PREFIX,
      );
    }, 60000);
  }
}

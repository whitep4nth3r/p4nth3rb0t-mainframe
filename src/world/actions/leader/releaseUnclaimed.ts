import { database } from "../../../data/database";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import { sendPantherworldFeedEvent } from "../../../discord";
import { WorldState } from "../../state";
import { getRandomEntry } from "../../../utils/getRandomEntry";
import { PantherworldZones, Zone } from "../../zones";
import WebsocketServer from "../../../classes/WebSocketServer";
import {
  MainframeEvent,
  ReleaseUnclaimedPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { PantherworldEvent } from "../../api/types";

export async function releaseUnclaimed(zoneName?: string): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);

  const randomZone =
    zoneName !== undefined
      ? PantherworldZones.find((fullZone) => fullZone.name === zoneName)
      : getRandomEntry(PantherworldZones);

  const unclaimed = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId IS NULL")
    .andWhere("item.zone = :zone", { zone: randomZone.name })
    .groupBy("item.name")
    .select("item.name", "_id")
    .addSelect("COUNT(item.id)", "count")
    .orderBy("count", "DESC")
    .getRawMany();

  if (unclaimed.length === 0) {
    const message = `${config.BOT_PREFIX}🪹 There are no unclaimed items in the ${randomZone.name} zone!`;

    tmi.say(config.channel, message);
  } else if (!zoneContainsActiveRelease(randomZone)) {
    WorldState.RELEASE_ZONES.push(randomZone);

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
      const zone = WorldState.RELEASE_ZONES.shift();
      const message = `Released items in the ${zone.name} locked!`;
      tmi.say(config.channel, `${config.BOT_PREFIX}🔒 ${message}`);

      await sendPantherworldFeedEvent(
        message,
        PantherworldEvent.LOCK,
        config.BOT_PREFIX,
      );
    }, 60000);
  }
}

export function zoneContainsActiveRelease(randomZone: Zone): boolean {
  return WorldState.RELEASE_ZONES.find((z) => z === randomZone) !== undefined;
}

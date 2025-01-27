import { getPlayerZoneString } from "./locate";
import { database } from "../../../data/database";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { WorldItems } from "../../items/all";
import { PantherworldEvent, WorldItem } from "../../api/types";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import { getRandomEntry } from "../../../utils/getRandomEntry";
import { sendPantherworldFeedEvent } from "../../../discord";
import {
  MainframeEvent,
  PlayerScannedPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebsocketServer from "../../../classes/WebSocketServer";

export function getFullItemsFromDBAggregate(dbItems: any[]): WorldItem[] {
  const itemNames = dbItems.map((item) => item._id);

  return WorldItems.filter((item) => itemNames.includes(item.name));
}

export function getCountOfDbItemByName(name: string, dbItems: any[]): number {
  return dbItems.find((item) => item._id === name).count;
}

function getStringListOfAvailableKeyValuePairs(keyValuePairs: object): string {
  const list = [];

  for (const [key, value] of Object.entries(keyValuePairs)) {
    list.push(`${value} ${key}`);
  }

  return list.length > 0 ? list.join(", ") : "no";
}

// not tested because of random key generation
export function getCategoryCountKeyValuePairs(
  fullWorldItems: WorldItem[],
  dbQueryItems,
) {
  const keyValuePairs = fullWorldItems.map((item) => {
    return {
      [getRandomEntry(item.categories)]: getCountOfDbItemByName(
        item.name,
        dbQueryItems,
      ),
    };
  });

  return keyValuePairs;
}

export async function scanZone(
  userId: string,
  username: string,
): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);

  const zone = await getPlayerZoneString(userId);

  if (zone === null) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}👀 @${username} cannot scan when not in p4nth3rworld. Use !move [zone] to land.`,
    );
    return;
  }

  const itemsInDb = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId IS NULL")
    .andWhere("item.zone = :zone", { zone })
    .groupBy("item.name")
    .select("item.name", "_id")
    .addSelect("COUNT(item.id)", "count")
    .getRawMany();

  const fullItems = getFullItemsFromDBAggregate(itemsInDb);

  const baseList = getCategoryCountKeyValuePairs(fullItems, itemsInDb);
  const deDupedList = {};

  baseList.forEach((item) => {
    const value = Object.values(item).pop();
    const category = Object.keys(item).pop();
    if (Object.keys(deDupedList).includes(category)) {
      deDupedList[category] += value;
    } else {
      deDupedList[category] = value;
    }
  });

  const scannedMessage = `@${username} scanned ${zone} zone and observed: ${getStringListOfAvailableKeyValuePairs(
    deDupedList,
  )} items`;

  tmi.say(config.channel, `${config.BOT_PREFIX}👀 ${scannedMessage}`);

  await sendPantherworldFeedEvent(
    scannedMessage,
    PantherworldEvent.SCANNED,
    config.BOT_PREFIX,
  );

  let totalCount = 0;
  itemsInDb.forEach((item) => (totalCount += item.count));

  const playerCookEvent: PlayerScannedPacket = {
    event: MainframeEvent.playerScanned,
    id: userId + "-" + Date.now(),
    type: "scanned",
    data: {
      zone: zone,
      username: username,
      count: totalCount,
    },
  };

  WebsocketServer.sendData(playerCookEvent);
}

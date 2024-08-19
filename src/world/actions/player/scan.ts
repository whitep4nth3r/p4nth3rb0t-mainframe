import { getPlayerZoneString } from "./locate";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import { WorldItems } from "../../items/all";
import { WorldItem } from "../../api/types";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import { getRandomEntry } from "../../../utils/getRandomEntry";

export function getFullItemsFromDBAggregate(dbItems: any[]): WorldItem[] {
  const itemNames = dbItems.map((item) => item._id);

  return WorldItems.filter((item) => itemNames.includes(item.name));
}

export function getCountOfDbItemByName(name: string, dbItems: any[]): number {
  return dbItems.find((item) => item._id === name).count;
}

function getStringListOfAvailableKeyValuePairs(keyValuePairs: {}): string {
  const list = [];

  for (const [key, value] of Object.entries(keyValuePairs)) {
    list.push(`${value} ${key}`);
  }

  return list.join(", ");
}

// not tested because of random key generation
export function getCategoryCountKeyValuePairs(fullWorldItems, dbQueryItems) {
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
  // get user's current zone
  const zone = await getPlayerZoneString(userId);

  // look up all unclaimed items in current zone from DB
  const itemsInDb = await PantherworldItemModel.aggregate([
    { $match: { userId: null, zone: zone } },
    { $group: { _id: "$name", count: { $sum: 1 } } },
  ]);

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

  tmi.say(
    config.channel,
    `${config.BOT_PREFIX}👀 @${username} scanned ${zone} zone and observed: ${getStringListOfAvailableKeyValuePairs(deDupedList)} items`,
  );
}

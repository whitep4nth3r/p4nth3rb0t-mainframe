import PantherworldItemModel from "../data/models/PantherworldItem";
import * as Sentry from "@sentry/node";

export async function saveItem(
  name: string,
  rarity: number,
  zone: string,
  cooked?: boolean,
  userId?: string,
): Promise<void> {
  try {
    const newItemData = {
      name: name,
      zone: zone,
      rarity: rarity,
      ...(cooked !== undefined && { cooked: cooked }),
      ...(userId !== undefined && { userId: userId }),
    };

    const item = await PantherworldItemModel.create(newItemData);
    console.log(`${item.name} in ${item.zone} saved (rarity: ${rarity})`);
  } catch (error) {
    Sentry.captureException(error);
  }
}

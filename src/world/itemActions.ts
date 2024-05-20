import PantherworldItemModel from "../data/models/PantherworldItem";
import * as Sentry from "@sentry/node";

export async function saveItem(
  name: string,
  rarity: number,
  zone: string,
): Promise<void> {
  try {
    const item = await PantherworldItemModel.create({
      name: name,
      zone: zone,
      rarity: rarity,
    });
    console.log(`${item.name} in ${item.zone} saved (rarity: ${rarity})`);
  } catch (error) {
    Sentry.captureException(error);
  }
}

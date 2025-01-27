import * as Sentry from "@sentry/node";
import { database } from "../data/database";
import { PantherworldItem } from "../data/entities/PantherworldItemEntity";
import { PantherworldZoneNames } from "./zones";

export async function saveItem(
  name: string,
  rarity: number,
  zone: string,
  cooked?: boolean,
  userId?: string,
): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);

  try {
    const newItemData = itemRepository.create({
      name: name,
      zone: zone as keyof typeof PantherworldZoneNames,
      rarity: rarity,
      ...(cooked !== undefined && { cooked: cooked }),
      ...(userId !== undefined && { userId: userId }),
    });

    const item = await itemRepository.save(newItemData);

    console.log(`${item.name} in ${item.zone} saved (rarity: ${rarity})`);
  } catch (error) {
    Sentry.captureException(error);
  }
}

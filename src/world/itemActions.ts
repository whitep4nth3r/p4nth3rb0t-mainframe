import PantherworldItemModel from "../data/models/PantherworldItem";
import * as Sentry from "@sentry/node";

export async function saveItem(name: string, zone: string): Promise<void> {
  try {
    const item = await PantherworldItemModel.create({
      name: name,
      zone: zone,
    });
    console.log(`${item.name} in ${item.zone} saved`);
  } catch (error) {
    Sentry.captureException(error);
  }
}

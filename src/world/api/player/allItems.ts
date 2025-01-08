import PantherworldItemModel from "../../../data/models/PantherworldItem";
import type { ItemForWealthIndex } from "../types";

export async function getAllItemsForPlayer(
  userId: string,
): Promise<ItemForWealthIndex[]> {
  const allItems = await PantherworldItemModel.aggregate([
    { $match: { userId: userId, used: { $ne: true }, spoiled: { $ne: true } } },
    {
      $group: {
        _id: "$name",
        count: { $sum: 1 },
        rarity: { $first: "$rarity" },
      },
    },
  ]);

  return allItems;
}

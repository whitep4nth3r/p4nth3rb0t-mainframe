import PantherworldItemModel from "../../../data/models/PantherworldItem";
import type { ItemForWealthIndex } from "../types";

export async function getAllItemsForPlayerToCalculateWealthIndex(
  userId: string,
): Promise<ItemForWealthIndex[]> {
  const allItems = await PantherworldItemModel.aggregate([
    { $match: { userId: userId } },
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

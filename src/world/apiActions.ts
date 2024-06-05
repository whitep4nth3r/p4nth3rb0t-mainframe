import PantherworldItemModel from "../data/models/PantherworldItem";
import PantherworldPlayerModel from "../data/models/PantherworldPlayer";
import { WorldItem } from "./items/all";

export async function getLocation(userId: string): Promise<string> {
  const entry = await PantherworldPlayerModel.findOne({
    userId: userId,
  });
  if (entry) {
    return entry.zone;
  } else {
    return "Not found";
  }
}

type InventoryResponse = {
  total: number;
  items: WorldItem[];
  location: string;
};

export async function getFullInventory(
  userId: string,
): Promise<InventoryResponse> {
  const items = await PantherworldItemModel.aggregate([
    // Match documents with a specific userId
    { $match: { userId: userId } },

    // Group documents by name, count the number of items in each group
    {
      $group: {
        _id: "$name",
        rarity: { $first: "$rarity" },
        count: { $sum: 1 },
      },
    },

    // Project to rename _id to name
    {
      $project: {
        _id: 0,
        name: "$_id",
        count: 1,
        rarity: 1,
      },
    },

    // Sort the groups by rarity in descending order
    { $sort: { rarity: -1 } },
  ]);

  let total = 0;

  items.forEach((item) => (total += item.count));

  let locationString = "Not found";
  const location = await PantherworldPlayerModel.findOne({
    userId: userId,
  });

  if (location) {
    locationString = location.zone;
  }

  return { total, items, location: locationString };
}

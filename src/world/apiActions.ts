import PantherworldItemModel from "../data/models/PantherworldItem";

export async function getFullInventory(userId: string) {
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

  return { total, items };
}

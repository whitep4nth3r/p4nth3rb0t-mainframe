import PantherworldItemModel from "../../../data/models/PantherworldItem";
import { tmi } from "../../../tmi";
import { config } from "../../../config";

export async function getInventory(
  userId: string,
  username: string,
): Promise<void> {
  // TODO - simplify query?
  const items = await PantherworldItemModel.aggregate([
    // Match documents with a specific userId
    { $match: { userId: userId } },

    // Group documents by name, count the number of items in each group
    { $group: { _id: "$name", count: { $sum: 1 } } },

    // Sort the groups by count in descending order
    { $sort: { count: -1 } },
  ]);

  let total = 0;

  items.forEach((item) => (total += item.count));

  const list = items.map((item) => `${item.count} ${item._id}`).join(", ");
  const itemString = list.length === 0 || list.length > 1 ? "items" : "item";

  tmi.say(
    config.channel,
    `${config.BOT_PREFIX}🎒 @${username}: you have ${total} ${itemString}. View your full inventory at https://p4nth3r.world/`,
  );
}

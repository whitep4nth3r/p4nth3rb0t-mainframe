import { database } from "../../../data/database";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { tmi } from "../../../tmi";
import { config } from "../../../config";

export async function getInventory(
  userId: string,
  username: string,
): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);

  const items = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId = :userId", { userId })
    .andWhere("item.used = false")
    .andWhere("item.spoiled = false")
    .groupBy("item.name")
    .select("item.name", "_id")
    .addSelect("COUNT(item.id)", "count")
    .orderBy("count", "DESC")
    .getRawMany();

  let total = 0;

  items.forEach((item) => (total += item.count));

  const list = items.map((item) => `${item.count} ${item._id}`).join(", ");
  const itemString = list.length === 0 || list.length > 1 ? "items" : "item";

  tmi.say(
    config.channel,
    `${config.BOT_PREFIX}🎒 @${username}: you have ${total} ${itemString}. View your full inventory at https://p4nth3r.world/`,
  );
}

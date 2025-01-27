import { config } from "../../../config";
import { database } from "../../../data/database";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { PantherworldPlayer } from "../../../data/entities/PantherworldPlayerEntity";
import { tmi } from "../../../tmi";

export async function removeInactive() {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const itemsGroupedByPlayer = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId IS NOT NULL")
    .andWhere("item.used = false")
    .andWhere("item.spoiled = false")
    .groupBy("item.userId")
    .select("item.userId", "_id")
    .addSelect("array_agg(item)", "items")
    .getRawMany();

  const playersWith2ItemsOrFewer = itemsGroupedByPlayer.filter(
    (player) => player.items.length <= 2,
  );

  const itemIdsToRemoveFromUsers = playersWith2ItemsOrFewer
    .map((player) => player.items.map((item) => item.id))
    .flat();

  const updateItems = await itemRepository
    .createQueryBuilder()
    .update(PantherworldItem)
    .set({ userId: null })
    .whereInIds(itemIdsToRemoveFromUsers)
    .execute();

  if (updateItems.affected > 0) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}♻️ ${updateItems.affected} items reclaimed from inactive users`,
    );
  }

  const inactivePlayerIds = playersWith2ItemsOrFewer.map(
    (player) => player._id,
  );

  const deleteUsers = await playerRepository
    .createQueryBuilder()
    .delete()
    .from(PantherworldPlayer)
    .whereInIds(inactivePlayerIds)
    .execute();

  if (deleteUsers.affected > 0) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}💀 ${deleteUsers.affected} inactive players removed from p4nth3rworld`,
    );
  } else {
    tmi.say(config.channel, `${config.BOT_PREFIX}🚨 No inactive players`);
  }
}

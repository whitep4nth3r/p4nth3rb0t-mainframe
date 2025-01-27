import { config } from "../../../config";
import { database } from "../../../data/database";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { PantherworldPlayer } from "../../../data/entities/PantherworldPlayerEntity";
import { tmi } from "../../../tmi";

export async function freeForAll() {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const itemsGroupedByZone = await itemRepository
    .createQueryBuilder("item")
    .where("item.userId IS NULL")
    .andWhere("item.used = false")
    .andWhere("item.spoiled = false")
    .andWhere("item.zone IS NOT NULL")
    .groupBy("item.zone")
    .select("item.zone", "zone")
    .addSelect("array_agg(item)", "items")
    .getRawMany();

  const playersGroupedByZone = await playerRepository
    .createQueryBuilder("player")
    .groupBy("player.zone")
    .select("player.zone", "zone")
    .addSelect("array_agg(player)", "players")
    .getRawMany();

  const writeQuery = [];

  itemsGroupedByZone.forEach((zone) => {
    const currentZone = zone.zone;

    if (zone.items.length > 0) {
      tmi.say(
        config.channel,
        `${config.BOT_PREFIX}📡 Searching ${currentZone}...`,
      );
      const playersInZone = playersGroupedByZone.find(
        (group) => group.zone === currentZone,
      );

      if (playersInZone.players.length > 0) {
        const itemsPerPlayer = Math.floor(
          zone.items.length / playersInZone.players.length,
        );

        if (itemsPerPlayer === 0) {
          tmi.say(
            config.channel,
            `${config.BOT_PREFIX}⛔️ 0 items per player in ${currentZone}`,
          );
        } else {
          tmi.say(
            config.channel,
            `${config.BOT_PREFIX}🍾 Distributing ${itemsPerPlayer} per player`,
          );

          playersInZone.players.forEach((player) => {
            for (let i = 1; i <= itemsPerPlayer; i++) {
              if (zone.items.length > 0) {
                const itemToDistribute = zone.items.pop();

                writeQuery.push({
                  id: itemToDistribute.id,
                  userId: player.id,
                });
              }
            }
          });
        }
      } else {
        tmi.say(
          config.channel,
          `${config.BOT_PREFIX}⛔️ No players in ${currentZone} to receive items!`,
        );
      }
    }
  });

  for (const query of writeQuery) {
    await itemRepository.update(query.id, { userId: query.userId });
  }

  if (writeQuery.length > 0) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}📣 FREE-FOR-ALL DELIVERED! CHECK YOUR ITEMS TO SEE WHAT YOU'VE WON!`,
    );
  }
}

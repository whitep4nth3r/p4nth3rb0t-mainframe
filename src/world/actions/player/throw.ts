import { database } from "../../../data/database";
import { PantherworldPlayer } from "../../../data/entities/PantherworldPlayerEntity";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import WebsocketServer from "../../../classes/WebSocketServer";
import {
  MainframeEvent,
  PlayerDropPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { sendPantherworldFeedEvent } from "../../../discord";
import { PantherworldEvent } from "../../api/types";

export async function throwItem(
  item: string,
  userId: string,
  displayName: string,
): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const zoneQuery = await playerRepository.findOne({
    where: { userId: userId },
  });

  if (zoneQuery !== null) {
    const itemUpdate = await itemRepository.findOne({
      where: { userId: userId, name: item },
    });

    if (itemUpdate !== null) {
      itemUpdate.userId = null;
      itemUpdate.zone = zoneQuery.zone;
      itemUpdate.dropped = true;
      await itemRepository.save(itemUpdate);

      const message = `@${displayName} dropped ${item} in the ${zoneQuery.zone} zone! (rarity: ${itemUpdate.rarity})`;

      tmi.say(config.channel, `${config.BOT_PREFIX}🫳 ${message}`);

      await sendPantherworldFeedEvent(
        message,
        PantherworldEvent.THROW,
        config.BOT_PREFIX,
      );

      const playerDropEvent: PlayerDropPacket = {
        event: MainframeEvent.playerDrop,
        id: userId + "-" + Date.now(),
        type: "drop",
        data: {
          username: displayName,
          zone: zoneQuery.zone,
          item: item,
          rarity: itemUpdate.rarity,
        },
      };

      WebsocketServer.sendData(playerDropEvent);
    } else {
      tmi.say(
        config.channel,
        `${config.BOT_PREFIX} @${displayName} nothing to throw!`,
      );
    }
  }
}

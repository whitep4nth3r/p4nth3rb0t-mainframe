import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
import PantherworldItemModel, {
  PantherworldItemDoc,
} from "../../../data/models/PantherworldItem";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import WebsocketServer from "../../../WebSocketServer";
import {
  MainframeEvent,
  PlayerDropPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { sendPantherworldFeedEvent } from "../../../discord";

export async function dropItem(
  item: string,
  userId: string,
  displayName: string,
): Promise<void> {
  const zoneQuery = await PantherworldPlayerModel.findOne({
    userId: userId,
  });

  if (zoneQuery !== null) {
    // any because whatever
    const itemUpdate: any = (await PantherworldItemModel.findOneAndUpdate(
      { userId: userId, name: item },
      {
        userId: null,
        zone: zoneQuery.zone,
        dropped: true,
      },
      { returnDocument: "after" },
    )) as PantherworldItemDoc | null;

    if (itemUpdate !== null) {
      const message = `${config.BOT_PREFIX}🫳 @${displayName} dropped ${item} in the ${zoneQuery.zone} zone! (rarity: ${itemUpdate.rarity})`;

      tmi.say(config.channel, message);

      await sendPantherworldFeedEvent(message);

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
        `${config.BOT_PREFIX} @${displayName} nothing to drop!`,
      );
    }
  }
}

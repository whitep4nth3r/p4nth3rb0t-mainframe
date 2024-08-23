import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
import PantherworldItemModel from "../../../data/models/PantherworldItem";
import { tmi } from "../../../tmi";
import { config } from "../../../config";

import WebsocketServer from "../../../WebSocketServer";
import {
  MainframeEvent,
  PlayerClaimPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { sendPantherworldFeedEvent } from "../../../discord";
import { WorldState } from "../../state";
import { wealthDistribution } from "../wealth/wealthDistribution";
import { PantherworldEvent } from "../../api/types";

export async function claimItem(
  name: string,
  userId: string,
  username: string,
): Promise<void> {
  let items = [];

  if (WorldState.RELEASE_ZONES.length === 0) {
    // claimable items are those spawned or dropped < 1 minute ago
    const oneMinuteAgo = new Date(Date.now() - 1000 * 60);

    items = await PantherworldItemModel.find({
      name: name,
      $or: [{ createdAt: { $gt: oneMinuteAgo } }, { dropped: true }],
    });
  } else {
    const itemQueries = WorldState.RELEASE_ZONES.map(async (releaseZone) => {
      const zoneItems = await PantherworldItemModel.find({
        name: name,
        userId: null,
        zone: releaseZone.name,
      });
      items.push(...zoneItems);
    });
    await Promise.all(itemQueries);
  }

  if (items.length === 0) {
    return;
  } else {
    const player = await PantherworldPlayerModel.findOne({ userId: userId });

    if (!player) {
      tmi.say(
        config.channel,
        `${config.BOT_PREFIX}❌ @${username}: you are not in p4nth3rworld. Use !move [zone] to land`,
      );
      return;
    }

    if (player) {
      const firstClaimableItem = items.find(
        (item) => item.zone === player.zone,
      );

      if (firstClaimableItem === undefined) {
        tmi.say(
          config.channel,
          `${config.BOT_PREFIX}❌ @${username}: You are in the wrong zone. !move to try and claim it!`,
        );
      } else if (firstClaimableItem.userId === userId) {
        // do nothing because it was already claimed
        return;
      } else {
        // user can claim item

        // 5% chance of getting a bonus item
        const willGetBonus = Math.random() > 0.95;

        // claim original item
        const updatedItem = await PantherworldItemModel.updateOne(
          {
            _id: firstClaimableItem._id,
          },
          {
            userId: userId,
            dropped: null,
          },
        );

        if (updatedItem.modifiedCount === 1) {
          const bonusMessage = willGetBonus
            ? `, and got a bonus ${name}! 🎉`
            : "";

          if (willGetBonus) {
            await PantherworldItemModel.create({
              name: firstClaimableItem.name,
              userId: userId,
              zone: firstClaimableItem.zone,
              rarity: firstClaimableItem.rarity,
            });
          }

          const message = `@${username} claimed ${name} in the ${player.zone} zone (rarity: ${firstClaimableItem.rarity})${bonusMessage}`;

          tmi.say(config.channel, `${config.BOT_PREFIX}🎒 ${message}`);
          await sendPantherworldFeedEvent(
            message,
            PantherworldEvent.CLAIM,
            config.BOT_PREFIX,
          );

          const playerClaimEvent: PlayerClaimPacket = {
            event: MainframeEvent.playerClaim,
            id: userId + "-" + Date.now(),
            type: "claim",
            data: {
              username: username,
              zone: player.zone,
              item: name,
              rarity: firstClaimableItem.rarity,
            },
          };

          WebsocketServer.sendData(playerClaimEvent);

          await wealthDistribution(userId, username);
        }
      }
    }
  }
}

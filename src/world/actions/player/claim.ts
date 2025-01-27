import { database } from "../../../data/database";
import { PantherworldPlayer } from "../../../data/entities/PantherworldPlayerEntity";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import WebsocketServer from "../../../classes/WebSocketServer";
import {
  MainframeEvent,
  PlayerClaimPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { sendPantherworldFeedEvent } from "../../../discord";
import { WorldState } from "../../state";
import { wealthDistribution } from "../wealth/wealthDistribution";
import { PantherworldEvent } from "../../api/types";
import { MoreThan } from "typeorm";
import { PantherworldZoneNames } from "../../zones";

export async function claimItem(
  name: string,
  userId: string,
  username: string,
): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  let items = [];

  if (WorldState.RELEASE_ZONES.length === 0) {
    const oneMinuteAgo = new Date(Date.now() - 1000 * 60);

    items = await itemRepository.find({
      where: {
        name: name,
        createdAt: MoreThan(oneMinuteAgo),
        dropped: true,
      },
    });
  } else {
    const itemQueries = WorldState.RELEASE_ZONES.map(async (releaseZone) => {
      const zoneItems = await itemRepository.find({
        where: {
          name: name,
          userId: null,
          zone: releaseZone.name as keyof typeof PantherworldZoneNames,
        },
      });
      items.push(...zoneItems);
    });
    await Promise.all(itemQueries);
  }

  if (items.length === 0) {
    return;
  } else {
    const player = await playerRepository.findOne({
      where: { id: userId },
    });

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
        return;
      } else {
        const willGetBonus = Math.random() > 0.95;

        firstClaimableItem.userId = player;
        firstClaimableItem.dropped = false;
        await itemRepository.save(firstClaimableItem);

        if (willGetBonus) {
          const bonusItem = itemRepository.create({
            name: firstClaimableItem.name,
            userId: player,
            zone: firstClaimableItem.zone,
            rarity: firstClaimableItem.rarity,
          });
          await itemRepository.save(bonusItem);
        }

        const bonusMessage = willGetBonus
          ? `, and got a bonus ${name}! 🎉`
          : "";

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

import { database } from "../../../data/database";
import { PantherworldPlayer } from "../../../data/entities/PantherworldPlayerEntity";
import { PantherworldItem } from "../../../data/entities/PantherworldItemEntity";
import UserManager from "../../../users/UserManager";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import WebsocketServer from "../../../classes/WebSocketServer";
import {
  MainframeEvent,
  PlayerGiftPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { sendPantherworldFeedEvent } from "../../../discord";
import { getLocation } from "../../api/player/location";
import { getRandomEntryAndModifiedArray } from "../../../utils/getRandomEntry";
import { getCurrentChatters } from "../../../utils/twitchUtils";
import { TwitchUser } from "../../../data/types";
import { PantherworldEvent } from "../../api/types";
import { wealthDistribution } from "../wealth/wealthDistribution";

function isUserIdInCurrentChatters(
  currentChatters: TwitchUser[],
  userId: string,
) {
  return currentChatters.find((chatter) => chatter.user_id === userId);
}

export function getRandPlayerInSameZoneFromCurrentChatters(
  currentChatters: any[],
  players: any[],
): PantherworldPlayer | null {
  if (currentChatters.length === 0) {
    return null;
  }

  let randEntryAndModifiedArray = getRandomEntryAndModifiedArray(players);

  let counter = 0;

  while (
    isUserIdInCurrentChatters(
      currentChatters,
      randEntryAndModifiedArray.entry.userId,
    ) === undefined &&
    counter < currentChatters.length
  ) {
    if (counter === currentChatters.length - 1) {
      return null;
    }

    counter++;

    randEntryAndModifiedArray = getRandomEntryAndModifiedArray(
      randEntryAndModifiedArray.array,
    );
  }

  return randEntryAndModifiedArray.entry;
}

export async function giftItem(
  item: string,
  receiver: string,
  giverId: string,
  giverName: string,
): Promise<void> {
  const itemRepository = database.getRepository(PantherworldItem);
  const playerRepository = database.getRepository(PantherworldPlayer);

  const nonEligibleMessage = `${config.BOT_PREFIX}❌ @${giverName}: there is no one eligible to receive your gift`;

  const currentChatters = await getCurrentChatters();

  if (currentChatters.length === 0) {
    return;
  }

  const giverZone = await getLocation(giverId);
  let receiverAsUser;

  if (receiver === "random") {
    const allPlayersInGiverZone = await playerRepository.find({
      where: { zone: giverZone },
    });

    const allPlayersInGiverZoneMinusReceiver = allPlayersInGiverZone.filter(
      (player) => player.userId !== giverId,
    );

    if (allPlayersInGiverZoneMinusReceiver.length === 0) {
      tmi.say(config.channel, nonEligibleMessage);
      return;
    } else {
      const randPlayer = getRandPlayerInSameZoneFromCurrentChatters(
        currentChatters,
        allPlayersInGiverZoneMinusReceiver,
      );

      if (randPlayer === null) {
        tmi.say(config.channel, nonEligibleMessage);
        return;
      }

      receiverAsUser = await UserManager.getUserById(randPlayer.userId);
    }
  } else {
    receiverAsUser = await UserManager.getUserByLogin(receiver);
  }

  if (!receiverAsUser) {
    return;
  }

  if (receiverAsUser.id === giverId) {
    return;
  }

  const receiverZone = await getLocation(receiverAsUser.id);

  if (giverZone !== receiverZone) {
    const message = `${config.BOT_PREFIX}❌ @${giverName}: you must be in the same zone as the receiver!`;
    tmi.say(config.channel, message);

    return;
  }

  const itemUpdate = await itemRepository.findOne({
    where: { userId: giverId, name: item },
  });

  if (itemUpdate) {
    itemUpdate.userId = receiverAsUser.id;
    itemUpdate.zone = giverZone as keyof typeof PantherworldZoneNames;
    await itemRepository.save(itemUpdate);

    const message = `@${giverName} gifted ${item} to @${receiverAsUser.display_name} in the ${giverZone} zone! (rarity: ${itemUpdate.rarity})`;

    tmi.say(config.channel, `${config.BOT_PREFIX}🎁 ${message}`);

    await sendPantherworldFeedEvent(
      message,
      PantherworldEvent.GIFT,
      config.BOT_PREFIX,
    );

    const playerGiftEvent: PlayerGiftPacket = {
      event: MainframeEvent.playerGift,
      id: receiverAsUser.id + "-" + Date.now(),
      type: "gift",
      data: {
        giver: giverName,
        receiver: receiverAsUser.display_name,
        zone: giverZone,
        item: item,
        rarity: itemUpdate.rarity,
      },
    };

    WebsocketServer.sendData(playerGiftEvent);

    await wealthDistribution(receiverAsUser.display_name, receiverAsUser.id);
  }
}

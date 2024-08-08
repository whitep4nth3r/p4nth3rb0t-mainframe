import PantherworldPlayerModel, {
  PantherworldPlayerDoc,
} from "../../../data/models/PantherworldPlayer";
import UserManager from "../../../users/UserManager";
import PantherworldItemModel, {
  PantherworldItemDoc,
} from "../../../data/models/PantherworldItem";
import { tmi } from "../../../tmi";
import { config } from "../../../config";
import WebsocketServer from "../../../WebSocketServer";
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
): PantherworldPlayerDoc | null {
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
  // !gift receiver item
  const nonEligibleMessage = `${config.BOT_PREFIX}❌ @${giverName}: there is no one eligible to receive your gift`;

  const currentChatters = await getCurrentChatters();

  if (currentChatters.length === 0) {
    return;
  }

  const giverZone = await getLocation(giverId);
  let receiverAsUser;

  if (receiver === "random") {
    const allPlayersInGiverZone = await PantherworldPlayerModel.find({
      zone: giverZone,
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
    // we shouldn't get here now because we remove the giver from the players array
    // but we'll leave it anyway
    return;
  }

  const receiverZone = await getLocation(receiverAsUser.id);

  if (giverZone !== receiverZone) {
    const message = `${config.BOT_PREFIX}❌ @${giverName}: you must be in the same zone as the receiver!`;
    tmi.say(config.channel, message);

    return;
  }

  const itemUpdate: any = (await PantherworldItemModel.findOneAndUpdate(
    { userId: giverId, name: item },
    {
      userId: receiverAsUser.id,
      zone: giverZone,
    },
    { returnDocument: "after" },
  )) as PantherworldItemDoc | null;

  if (itemUpdate !== null) {
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

    // attempt wealth distribution on recipient
    await wealthDistribution(
      receiverAsUser.display_name,
      receiverAsUser.user_id,
    );
  }
}

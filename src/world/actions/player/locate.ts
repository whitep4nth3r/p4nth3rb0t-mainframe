import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
import { tmi } from "../../../tmi";
import { config } from "../../../config";

export async function getPlayerZoneString(
  userId: string,
): Promise<string | null> {
  const entry = await PantherworldPlayerModel.findOne({
    userId: userId,
  });

  if (entry) {
    return entry.zone;
  } else {
    return null;
  }
}

export async function locatePlayer(
  userId: string,
  displayName: string,
): Promise<void> {
  const zone = await getPlayerZoneString(userId);

  if (zone !== null) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}📍 @${displayName}: you are in the ${zone} zone`,
    );
  } else {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}❌ @${displayName}: you are not in p4nth3rworld! Use !move [zone] to land`,
    );
  }
}

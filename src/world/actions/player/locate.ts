import PantherworldPlayerModel from "../../../data/models/PantherworldPlayer";
import { tmi } from "../../../tmi";
import { config } from "../../../config";

export async function locatePlayer(
  userId: string,
  displayName: string,
): Promise<void> {
  const entry = await PantherworldPlayerModel.findOne({
    userId: userId,
  });
  if (entry) {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}📍 @${entry.userDisplayName}: you are in the ${entry.zone} zone`,
    );
  } else {
    tmi.say(
      config.channel,
      `${config.BOT_PREFIX}❌ @${displayName}: you are not in p4nth3rworld! Use !move [zone] to land`,
    );
  }
}

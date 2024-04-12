import UserManager from "../users/UserManager";
import PantherworldPlayerModel from "../data/models/PantherworldPlayer";
import { tmi } from "./../tmi";
import { config } from "../config";

export async function locatePlayer(userId: string): Promise<void> {
  const user = await UserManager.getUserById(userId as string);

  if (user) {
    const entry = await PantherworldPlayerModel.findOne({
      userId: userId,
    });
    console.log(entry);
    if (entry) {
      tmi.say(
        config.channel,
        `📍 @${user.display_name}: you are in the ${entry.zone} zone`,
      );
    } else {
      tmi.say(
        config.channel,
        `❌ @${user.display_name}: you are not in p4ntherw0rld... yet`,
      );
    }
  }
}

export async function movePlayer(userId: string, zone: string): Promise<void> {
  const user = await UserManager.getUserById(userId as string);

  if (user) {
    await PantherworldPlayerModel.updateOne(
      { userId: userId },
      {
        userId: userId,
        userDisplayName: user.display_name,
        zone: zone,
      },
      { upsert: true },
    );

    tmi.say(config.channel, `➡️ ${user.display_name} moved to ${zone} zone`);
  }
}

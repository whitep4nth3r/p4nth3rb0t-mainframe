import { tmi } from "../../tmi";
import { config } from "../../config";
import { getCurrentChatters, getCurrentMods, banUser, Chatter } from "../../utils/twitchUtils";

export const megaTimeOut = async (): Promise<void> => {
  const currentChatters = await getCurrentChatters();
  const currentMods = await getCurrentMods();
  const currentModIds = currentMods.map(c => c.user_id);
  currentChatters.forEach(async (chatter: Chatter) => {
    if (!currentModIds.includes(chatter.user_id)) {
      await banUser(chatter.user_id);
    }
  });
};
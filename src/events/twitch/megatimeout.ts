import { getCurrentChatters, getCurrentMods, timeoutUserFor60Seconds } from "../../utils/twitchUtils";
import { TwitchUser } from "../../data/types";

export const megaTimeOut = async (): Promise<void> => {
  const currentChatters = await getCurrentChatters();
  if (currentChatters.length === 0) {
    return;
  }
  const currentMods = await getCurrentMods();
  const currentModIds = currentMods.map(c => c.user_id);
  currentChatters.forEach(async (chatter: TwitchUser) => {
    if (!currentModIds.includes(chatter.user_id)) {
      await timeoutUserFor60Seconds(chatter.user_id);
    }
  });
};
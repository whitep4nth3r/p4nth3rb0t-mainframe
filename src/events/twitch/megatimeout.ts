import {
  getCurrentChatters,
  getCurrentMods,
  timeoutUserFor60Seconds,
} from "../../utils/twitchUtils";

export const megaTimeOut = async (): Promise<void> => {
  const currentChatters = await getCurrentChatters();

  if (currentChatters.length === 0) {
    return;
  }

  const currentMods = await getCurrentMods();
  const currentModIds = currentMods.map((c) => c.user_id);

  for (const chatter of currentChatters) {
    if (!currentModIds.includes(chatter.user_id)) {
      await timeoutUserFor60Seconds(chatter.user_id);
    }
  }
};

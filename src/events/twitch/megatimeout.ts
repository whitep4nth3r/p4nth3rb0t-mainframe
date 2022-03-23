import { tmi } from "../../tmi";
import { config } from "../../config";
import { getCurrentChatters, getCurrentMods } from "../../utils/twitchUtils";

export const megaTimeOut = async (): Promise<void> => {
  const currentChatters = await getCurrentChatters();
  const currentMods = await getCurrentMods();

  currentChatters.forEach((chatter: string) => {
    if (!currentMods.includes(chatter)) {
      tmi.say(config.channel, `/timeout ${chatter} 120`);
    }
  });
};

import { Message, PartialMessage } from "discord.js";
import { config } from "../config";

export async function warnUser(message: Message | PartialMessage): Promise<any> {
  if (message.content !== null && message.author !== null) {
    if (
      message.content.includes(`<@!${config.discord.whitep4nth3rId}>`)
      && !config.discord.excludedChannels.includes(message.channel.id)
      && message.author.id !== config.discord.p4nth3rb0tId
    ) {
      await message.channel.send(
        `Attention <@!${message.author.id}>! Please refrain from mentioning ` +
        `whitep4nth3r directly if it is not extremely urgent. Thank you.`,
      );
    }
  }
}

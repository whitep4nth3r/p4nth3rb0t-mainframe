import {
  Events,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User,
} from "discord.js";
import { DiscordReactionRole } from "../../data/types";
import { config } from "../../config";
import { discord } from "../../discord";

discord.on(
  Events.MessageReactionAdd,
  async (
    messageReaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser,
  ) => {
    if (user.bot) {
      return;
    }

    if (messageReaction.partial) {
      await messageReaction.fetch();
    }

    const { guild } = messageReaction.message;

    if (!guild) {
      return;
    }

    const reactionRole: DiscordReactionRole | undefined =
      config.discord.reactionRole.find(
        (role) =>
          role.emoji_tag == messageReaction.emoji.toString() &&
          role.message_id == messageReaction.message.id,
      );

    if (!reactionRole) {
      return;
    }

    await guild.members.cache.get(user.id)?.roles.add(reactionRole.role_id);
  },
);

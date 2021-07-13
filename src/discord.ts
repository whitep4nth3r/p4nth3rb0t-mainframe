import DiscordAnnouncementModel from "./data/models/DiscordAnnouncement";
import Discord, { MessageEmbed, MessageReaction, User } from "discord.js";
import { config } from "./config";
import type { PartialUser, TextChannel } from "discord.js";
import { DiscordReactionRole, StreamAnnouncementInfoResolver, StreamingService } from "./data/types";

export const discord = new Discord.Client({
  partials: ["USER", "REACTION", "MESSAGE"],
});

let announcementsChannel: TextChannel;

discord.on("ready", async () => {
  console.log(`🤖 Logged in to Discord as ${discord.user?.username}!`);
  
  announcementsChannel = (await discord.channels.fetch(
    config.discord.liveAnnouncementsChannelId
  )) as TextChannel;
});

discord.on(
  "messageReactionAdd",
  async (messageReaction: MessageReaction, user: User | PartialUser) => {
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

    const reactionRole:
      | DiscordReactionRole
      | undefined = config.discord.reactionRole.find(
      (role) =>
        role.emoji_tag == messageReaction.emoji.toString() &&
        role.message_id == messageReaction.message.id,
    );

    if (!reactionRole) {
      return;
    }

    guild.member(user.id)?.roles.add(reactionRole.role_id);
  },
);

discord.on(
  "messageReactionRemove",
  async (messageReaction: MessageReaction, user: User | PartialUser) => {
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

    const reactionRole:
      | DiscordReactionRole
      | undefined = config.discord.reactionRole.find(
      (role) =>
        role.emoji_tag == messageReaction.emoji.toString() &&
        role.message_id == messageReaction.message.id,
    );

    if (!reactionRole) {
      return;
    }

    guild.member(user.id)?.roles.remove(reactionRole.role_id);
  },
);

export const sendLiveAnnouncement = async (streamInfo: StreamAnnouncementInfoResolver) => {
  if (announcementsChannel) {
    const info = await streamInfo.resolve();
    const embed = buildDiscordEmbed(
      true,
      info.streamer_info.name,
      info.streamer_info.display_name,
      info.streamer_info.avatar_url,
      info.title,
      info.thumbnail_url,
      `Started streaming • Today at ${info.started_at.toTimeString()}`,
      info.category_name,
      info.streaming_service
    );

    const onlineAnnouncementPrefix: string =
      process.env.NODE_ENV === "production"
        ? `<@&${config.discord.liveAnnouncementsRoleId}> `
        : "";

    const existing = await DiscordAnnouncementModel.findOne({
      streamId: info.id,
    });
    let message;
    if (existing) {
      message = await announcementsChannel.messages.fetch(
        `${existing.messageId}`
      );
      await message.edit({
        content: `${onlineAnnouncementPrefix}${Discord.Util.escapeMarkdown(
          info.streamer_info.name
        )} is now live on ${info.streaming_service.name}! ${info.streaming_service.base_url}${info.streamer_info.name}`,
        embed,
      });
    } else {
      message = await announcementsChannel.send({
        content: `${onlineAnnouncementPrefix}${Discord.Util.escapeMarkdown(
          info.streamer_info.name
        )} is now live on ${info.streaming_service.name}! ${info.streaming_service.base_url}${info.streamer_info.name}`,
        embed,
      });
    }

    await DiscordAnnouncementModel.updateOne(
      { memberId: info.streamer_info.id },
      {
        memberId: info.streamer_info.id,
        messageId: message.id,
        streamId: info.id,
        category: info.category_name,
      },
      { upsert: true }
    );
  }
};

export const sendOfflineAnnouncement = async (announcementResolver: StreamAnnouncementInfoResolver) => {
  const announcement = await announcementResolver.resolve();
  const saved_message = await DiscordAnnouncementModel.findOne({
    memberId: announcement.streamer_info.id,
  });

  if (!saved_message) {
    return;
  }
  const message = await announcementsChannel.messages.fetch(
    `${saved_message.messageId}`
  );
  let footer = "Finished streaming";
  if (announcement.archivedStream) {
    footer += ` • Streamed for ${announcement.archivedStream.duration}`;
  }
  const embed = buildDiscordEmbed(
    announcement.online,
    announcement.streamer_info.name,
    announcement.streamer_info.display_name,
    announcement.streamer_info.avatar_url,
    announcement.title,
    announcement.thumbnail_url,
    footer,
    saved_message.category,
    announcement.streaming_service,
    announcement.archivedStream?.id
  );

  await message.edit({
    content: `${announcement.streamer_info.display_name} was online!`,
    embed,
  });

  await DiscordAnnouncementModel.deleteOne({ memberId: announcement.streamer_info.id });
};

const buildDiscordEmbed = (
  online: boolean,
  userName: string,
  userDisplayName: string,
  userLogo: string,
  streamTitle: string,
  imageUrl: string,
  footer: string,
  gameName: string,
  service: StreamingService,
  videoId?: string
) => {
  const embed = new MessageEmbed();

  embed.setAuthor(userDisplayName, userLogo);
  embed.setTitle(streamTitle);
  embed.setThumbnail(userLogo);

  embed.setURL(
    online || videoId === undefined
      ? `${service.base_url}${userName}`
      : `${service.base_url}videos/${videoId}`
  );

  const imageReplaceString = online ? "{width}x{height}" : "%{width}x%{height}";
  
  embed.setImage(
    imageUrl?.replace(
      imageReplaceString,
      config.discord.liveAnnouncementImageSize
    )
  );

  embed.setColor(
    online
      ? config.discord.liveAnnouncementColorOnline
      : config.discord.liveAnnouncementColorOffline
  );

  embed.setFooter(footer);

  if (gameName.length) {
    embed.setDescription(gameName);
  }

  return embed;
};

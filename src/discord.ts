import UserManager from "./users/UserManager";
import DiscordAnnouncementModel from "./data/models/DiscordAnnouncement";
import Discord, { MessageEmbed } from "discord.js";
import { config } from "./config";
import {
  fetchVideoByUserId,
  getActiveBroadcasterStreamByBroadcasterId,
} from "./utils/twitchUtils";
import type { TextChannel } from "discord.js";
import type { StreamInfo } from "./data/types";

export const discord = new Discord.Client({
  partials: ["USER", "REACTION", "MESSAGE"],
});

let announcementsChannel: TextChannel;

discord.on("ready", async () => {
  console.log(`🤖 Logged in to Discord as ${discord.user?.username}!`);

  announcementsChannel = (await discord.channels.fetch(
    config.discord.liveAnnouncementsChannelId,
  )) as TextChannel;
});

export const sendLiveAnnouncement = async (streamInfo: StreamInfo) => {
  if (announcementsChannel) {
    const user = await UserManager.getUserById(streamInfo.broadcaster_user_id);

    if (user) {
      const started_at = new Date(streamInfo.started_at);
      const stream = await getActiveBroadcasterStreamByBroadcasterId(
        streamInfo.broadcaster_user_id,
      );

      const videoTitle = stream !== null ? stream.title : "";
      const videoThumbnailUrl = stream !== null ? stream.thumbnail_url : "";
      const category = stream !== null ? stream.game_name : "";

      const embed = buildDiscordEmbed(
        true,
        user.login,
        user.display_name,
        user.profile_image_url,
        videoTitle,
        videoThumbnailUrl,
        `Started streaming • Today at ${started_at.toTimeString()}`,
        category,
      );

      const onlineAnnouncementPrefix: string =
        process.env.NODE_ENV === "production"
          ? `<@&${config.discord.liveAnnouncementsRoleId}> `
          : "";

      const existing = await DiscordAnnouncementModel.findOne({
        streamId: streamInfo.id,
      });
      let message;
      if (existing) {
        message = await announcementsChannel.messages.fetch(
          `${existing.messageId}`,
        );
        await message.edit({
          content: `${onlineAnnouncementPrefix}${Discord.Util.escapeMarkdown(
            user.display_name,
          )} is now live on Twitch! https://twitch.tv/${user.login}`,
          embed,
        });
      } else {
        message = await announcementsChannel.send({
          content: `${onlineAnnouncementPrefix}${Discord.Util.escapeMarkdown(
            user.display_name,
          )} is now live on Twitch! https://twitch.tv/${user.login}`,
          embed,
        });
      }

      await DiscordAnnouncementModel.updateOne(
        { memberId: streamInfo.broadcaster_user_id },
        {
          memberId: streamInfo.broadcaster_user_id,
          messageId: message.id,
          streamId: streamInfo.id,
          category: category,
        },
        { upsert: true },
      );
    }
  }
};

export const sendOfflineAnnouncement = async (member_id: string) => {
  const video = await fetchVideoByUserId(member_id);

  if (!video) {
    return;
  }

  const saved_message = await DiscordAnnouncementModel.findOne({
    memberId: member_id,
  });

  if (!saved_message) {
    return;
  }

  const message = await announcementsChannel.messages.fetch(
    `${saved_message.messageId}`,
  );

  const user = await UserManager.getUserById(member_id);

  if (user) {
    const embed = buildDiscordEmbed(
      false,
      user.login,
      user.display_name,
      user.profile_image_url,
      video.title,
      video.thumbnail_url,
      `Finished streaming • Streamed for ${video.duration}`,
      saved_message.category,
      video.id,
    );

    await message.edit({
      content: `${user.display_name} was online!`,
      embed,
    });

    await DiscordAnnouncementModel.deleteOne({ memberId: member_id });
  }
};

const buildDiscordEmbed = (
  online: boolean,
  userName: string,
  userDisplayName: string,
  userLogo: string,
  streamTitle: string,
  imageUrl: string,
  footer: string,
  category: string,
  videoId?: string,
) => {
  const embed = new MessageEmbed();

  embed.setAuthor(userDisplayName, userLogo);
  embed.setTitle(streamTitle);
  embed.setThumbnail(userLogo);

  embed.setURL(
    online
      ? `https://twitch.tv/${userName}`
      : `https://twitch.tv/videos/${videoId}`,
  );

  const imageReplaceString = online ? "{width}x{height}" : "%{width}x%{height}";

  embed.setImage(
    imageUrl.replace(
      imageReplaceString,
      config.discord.liveAnnouncementImageSize,
    ),
  );

  embed.setColor(
    online
      ? config.discord.liveAnnouncementColorOnline
      : config.discord.liveAnnouncementColorOffline,
  );

  embed.setFooter(footer);

  if (category.length) {
    embed.setDescription(category);
  }

  return embed;
};

import * as Sentry from "@sentry/node";
import UserManager from "./users/UserManager";
import { tmi } from "./tmi";
import DiscordAnnouncementModel from "./data/models/DiscordAnnouncement";
import Discord, {
  EmbedBuilder,
  escapeMarkdown,
  GatewayIntentBits,
  Partials,
} from "discord.js";
import type { TextChannel, ForumChannel } from "discord.js";
import { config } from "./config";
import {
  fetchVideoByUserId,
  getActiveBroadcasterStreamByBroadcasterId,
} from "./utils/twitchUtils";
import type { StreamInfo } from "./data/types";
import { spawn, SpawnEventType } from "./world/spawn";

const getTwitchVodTimestampInSeconds = (
  date_now: Date,
  date_started: Date,
): string => {
  const date_now_s = date_now.getTime() / 1000;
  const date_started_s = date_started.getTime() / 1000;

  const seconds_ago = Math.round(date_now_s - date_started_s);

  return `${seconds_ago}s`;
};

export const discord = new Discord.Client({
  partials: [Partials.User, Partials.Reaction, Partials.Message],
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

const TWITCH_TTS_TAG_ID = "1186989607770923129";

let announcementsChannel: TextChannel;
let feedChannel: TextChannel;
let helpChannel: ForumChannel;

import "./events/discord/messageReactionAdd";
import "./events/discord/messageReactionRemove";

discord.on("ready", async () => {
  console.log(`🤖 Logged in to Discord as ${discord.user?.username}!`);

  announcementsChannel = (await discord.channels.fetch(
    config.discord.liveAnnouncementsChannelId,
  )) as TextChannel;

  feedChannel = (await discord.channels.fetch(
    config.discord.p4nth3rworldChannelId,
  )) as TextChannel;

  helpChannel = (await discord.channels.fetch(
    config.discord.techHelpChannelId,
  )) as ForumChannel;
});

const POST_TITLE_CHAR_LIMIT = 100;

export const createTechHelpThread = async (
  twitchUsername: string,
  message: string,
) => {
  try {
    const liveStream = await getActiveBroadcasterStreamByBroadcasterId(
      config.broadcaster.user_id,
    );

    if (liveStream !== null) {
      const vod = await fetchVideoByUserId(config.broadcaster.user_id);
      if (vod !== null) {
        const streamStartTime = new Date(liveStream.started_at);
        const now = new Date();

        const vodLink = `https://www.twitch.tv/videos/${
          vod.id
        }?t=${getTwitchVodTimestampInSeconds(now, streamStartTime)}`;

        const postTitle =
          message.length > POST_TITLE_CHAR_LIMIT
            ? message.slice(0, POST_TITLE_CHAR_LIMIT - 3) + "..."
            : message;

        const contentMeta = `Question asked by ${twitchUsername} on Twitch. \n\n👀 [View the VOD timestamp](${vodLink})`;

        const messageContent =
          message.length > POST_TITLE_CHAR_LIMIT
            ? `Full question: ${message} \n\n ${contentMeta}`
            : contentMeta;

        const newHelpPost = await helpChannel.threads.create({
          name: postTitle,
          message: {
            content: messageContent,
          },
          appliedTags: [TWITCH_TTS_TAG_ID],
          reason: "TTS redemption on whitep4nth3r's stream",
        });

        tmi.say(
          config.channel,
          `Thanks @${twitchUsername}! Your question has been posted to The Claw Discord for discussion. View it here: https://discord.com/channels/${newHelpPost.guildId}/${newHelpPost.id}`,
        );
      }
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};

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
          content: `${onlineAnnouncementPrefix}${escapeMarkdown(
            user.display_name,
          )} is now live on Twitch! https://twitch.tv/${user.login}`,
          embeds: [embed],
        });
      } else {
        message = await announcementsChannel.send({
          content: `${onlineAnnouncementPrefix}${escapeMarkdown(
            user.display_name,
          )} is now live on Twitch! https://twitch.tv/${user.login}`,
          embeds: [embed],
        });
      }

      await spawn({
        type: SpawnEventType.StreamOnline,
        data: { username: user.display_name },
      });

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
      embeds: [embed],
    });

    await DiscordAnnouncementModel.deleteOne({ memberId: member_id });
  }
};

export const sendPantherworldFeedEvent = async (message: string) => {
  if (feedChannel) {
    const embed = new EmbedBuilder()
      .setAuthor({
        name: "p4nth3r.world",
        url: "https://p4nth3r.world/",
      })
      .setDescription(message)
      .setColor("#84ae39");

    await feedChannel.send({
      embeds: [embed],
    });
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
  const embed = new EmbedBuilder();

  embed.setAuthor({
    name: userDisplayName,
    iconURL: userLogo,
  });

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

  embed.setFooter({
    text: footer,
  });

  if (category.length) {
    embed.setDescription(category);
  }

  return embed;
};

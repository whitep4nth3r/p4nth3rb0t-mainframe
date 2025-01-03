import * as Sentry from "@sentry/node";
import UserManager from "./users/UserManager";
import { tmi } from "./tmi";
import { database } from "./data/database";
import { DiscordAnnouncement } from "./data/entities/DiscordAnnouncementEntity";
import Discord, {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  escapeMarkdown,
  Events,
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

const discordAnnouncementRepository =
  database.getRepository(DiscordAnnouncement);

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
  partials: [
    Partials.User,
    Partials.Reaction,
    Partials.Message,
    Partials.GuildScheduledEvent,
  ],
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
let modChannel: TextChannel;
let helpChannel: ForumChannel;

import "./events/discord/messageReactionAdd";
import "./events/discord/messageReactionRemove";

discord.on(Events.ClientReady, async () => {
  console.log(`🤖 Logged in to Discord as ${discord.user?.username}!`);

  const channels = await Promise.all([
    discord.channels.fetch(config.discord.liveAnnouncementsChannelId),
    discord.channels.fetch(config.discord.modChannelId),
    discord.channels.fetch(config.discord.techHelpChannelId),
  ]);

  [announcementsChannel, modChannel, helpChannel] = channels as [
    TextChannel,
    TextChannel,
    ForumChannel,
  ];
});

const POST_TITLE_CHAR_LIMIT = 100;

export const sendModChannelAuthorizeMessage = async (url: string) => {
  const authorizeButton = new ButtonBuilder()
    .setLabel("Authorize with Twitch")
    .setStyle(ButtonStyle.Link)
    .setURL(url);

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    authorizeButton,
  );

  const embed = new EmbedBuilder()
    .setTitle("ACTION REQUIRED")
    .setDescription(`You need to authorize ${config.bot.user_name} with Twitch`)
    .setColor("#FF0000")
    .setTimestamp();

  await modChannel.send({
    content: `<@${config.discord.broadcasterUserId}>`,
    components: [row],
    embeds: [embed],
  });
};

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
        const streamStartTime = new Date(liveStream.data[0].started_at);
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

        await tmi.say(
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

      const videoTitle = stream !== null ? stream.data[0].title : "";
      const videoThumbnailUrl =
        stream !== null ? stream.data[0].thumbnail_url : "";
      const category = stream !== null ? stream.data[0].game_name : "";

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

      const existing = await discordAnnouncementRepository.findOne({
        where: {
          streamId: streamInfo.id,
        },
      });

      let message: Discord.Message<true>;

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

      const discordAnnouncement = new DiscordAnnouncement();
      discordAnnouncement.memberId = streamInfo.broadcaster_user_id;
      discordAnnouncement.messageId = message.id;
      discordAnnouncement.streamId = streamInfo.id;
      discordAnnouncement.category = category;

      await discordAnnouncementRepository.save(discordAnnouncement);
    }
  }
};

export const sendOfflineAnnouncement = async (member_id: string) => {
  const video = await fetchVideoByUserId(member_id);

  if (!video) {
    return;
  }

  const saved_message = await discordAnnouncementRepository.findOne({
    where: {
      memberId: member_id,
    },
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

    await discordAnnouncementRepository.delete({ memberId: member_id });
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

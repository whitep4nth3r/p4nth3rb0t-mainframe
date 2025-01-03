import { Badges } from "tmi.js";
import Discord from "discord.js";
import WebSocket from "ws";

export interface Config {
  BOT_PREFIX: string;
  FREEZE_MODE: boolean;
  broadcaster: TwitchUser;
  bot: TwitchUser;
  channel: string;
  drop: {
    minAccountAge: number;
  };
  emotes: {
    baseUrl: string;
    sizes: string[];
  };
  ignoredUsers: string[];
  ignoredCharacters: string[];
  ignoredWords: string[];
  ignoredMessages: string[];
  teamShoutoutEnabled: boolean;
  team: {
    name: string;
    displayName: string;
  };
  teamWelcomeMessage: (channel: TwitchChannel) => string;
  discord: {
    broadcasterUserId: string;
    liveAnnouncementsChannelId: string;
    liveAnnouncementsRoleId: string;
    liveAnnouncementColorOnline: Discord.ColorResolvable;
    liveAnnouncementColorOffline: Discord.ColorResolvable;
    liveAnnouncementImageSize: string;
    techHelpChannelId: string;
    modChannelId: string;
    reactionRole: DiscordReactionRole[];
  };
  moodRedemptions: {
    [key: string]: string;
  };
  channelRedemptions: {
    [key: string]: string;
  };
}

export interface ExtWebSocket extends WebSocket {
  isAlive: boolean;
}

export interface TwitchChannel {
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string;
  game_name: string;
  title: string;
}

export interface TwitchChannelResponse {
  data: TwitchChannel[];
}

export interface TwitchUser {
  user_id: string;
  user_name: string;
  user_login: string;
}

export type TeamMembers = TwitchUser[];

export interface TeamResponse {
  data: [
    {
      users: TwitchUser[];
      background_image_url: string;
      banner: string;
      created_at: string;
      updated_at: string;
      info: string;
      thumbnail_url: string;
      team_name: string;
      team_display_name: string;
      id: string;
    },
  ];
}

export interface AuthCodeResponse {
  code: string;
  scope: string;
}

export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  scope: [];
  token_type: string;
}

export interface UserAccessTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
}

export interface EventSubscriptionResponse {
  data: EventSubscription[];
  total: number;
  total_cost: number;
  max_total_cost: number;
  pagination: any;
}

export const enum EventSubType {
  StreamOnline = "stream.online",
  StreamOffline = "stream.offline",
  ChannelFollow = "channel.follow",
  HypeTrainBegin = "channel.hype_train.begin",
  HypeTrainProgress = "channel.hype_train.progress",
  HypeTrainEnd = "channel.hype_train.end",
}

export interface EventSubDefinition {
  userId: string;
  eventType: EventSubType;
  callbackUrl: string;
  version: string;
}

export interface EventSubscription {
  id: string;
  status: string;
  type: string;
  version: string;
  cost: number;
  condition: Condition;
  created_at: string;
  transport: Transport;
}

export interface Condition {
  broadcaster_user_id: string;
}

export interface Transport {
  method: string;
  callback: string;
}

export interface FullTwitchUser {
  id: string;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  profile_image_url: string;
  offline_image_url: string;
  view_count: number;
  created_at: string;
}

export interface TwitchUserResponse {
  data: FullTwitchUser[];
}

export interface TwitchRaidResponse {
  data: [];
}

export interface MyBadges extends Badges {
  founder?: string;
}

export interface TwitchVideo {
  id: string;
  stream_id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  title: string;
  description: string;
  created_at: string;
  published_at: string;
  url: string;
  thumbnail_url: string;
  viewable: string;
  view_count: number;
  language: string;
  type: string;
  duration: string;
  muted_segments: any;
}

export interface TwitchVideoResponse {
  data: TwitchVideo[];
  pagination: { cursor: string };
}

export interface StreamInfo {
  id: string;
  started_at: string;
  type: string;
  broadcaster_user_id: string;
  broadcaster_user_login: string;
  broadcaster_user_name: string;
}

export interface StreamByBroadcasterIdResponse {
  data: [
    {
      id: string;
      user_id: string;
      user_name: string;
      game_id: string;
      game_name: string;
      type: string;
      title: string;
      viewer_count: number;
      started_at: string;
      language: string;
      thumbnail_url: string;
      tag_ids: string[];
    },
  ];
}

export enum ImageDrops {
  Netlify = "netlify",
  Partner = "partner",
  Battlesnake = "battlesnake",
  TheClaw = "theclaw",
  Spooky = "spooky",
}

export interface DiscordReactionRole {
  role_id: string;
  emoji_tag: string;
  message_id: string;
}

export enum TwitchAnnouncementColor {
  Blue = "blue",
  Green = "green",
  Orange = "orange",
  Purple = "purple",
  Primary = "primary",
}

export type MoodEmotes = { [key: string]: string };

export interface StartRaidResponse {
  status: number;
  data: [];
}

export interface TwitchModeratorsResponse {
  data: TwitchUser[];
}

export interface TwitchCurrentChattersResponse {
  data: TwitchUser[];
}

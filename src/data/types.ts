import { Badges } from "tmi.js";
import UserManager from "../users/UserManager";
import { fetchGameById, fetchVideoByUserId } from "../utils/twitchUtils";

export interface TwitchChannel {
  broadcaster_id: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string;
  game_name: string;
  title: string;
}

export interface TeamMember {
  name: string;
  id: string;
}

export type TeamMembers = TeamMember[];

export interface TeamResponse {
  data: {
    users: [
      {
        name: string;
        _id: string;
      },
    ];
  };
}

export interface AccessTokenResponse {
  access_token: string;
  expires_in: number;
  scope: [];
  token_type: string;
}

export interface UserByIdResponse {
  display_name: string;
  _id: string;
  name: string;
  type: "user";
  bio: string;
  created_at: string;
  updated_at: string;
  logo: string;
}

export interface UserByLoginResponse {
  _total: number;
  users: [
    {
      display_name: string;
      _id: string;
      name: string;
      type: "user";
      bio: string;
      created_at: string;
      updated_at: string;
      logo: string;
    },
  ];
}

export interface MyBadges extends Badges {
  founder?: string;
}

export interface GameByIdResponse {
  name: string;
}

export interface VideoByUserIdResponse {
  id: string;
  thumbnail_url: string;
  duration: string;
  title: string;
}

export interface StreamInfo {
  game_id: string;
  id: string;
  language: string;
  started_at: string;
  tag_ids: string[];
  thumbnail_url: string;
  title: string;
  type: string;
  user_id: string;
  user_name: string;
  viewer_count: number;
}

export interface StreamAnnouncementInfo {
  id: string;
  category_name: string;
  language: string;
  started_at: Date;
  thumbnail_url: string;
  title: string;
  streamer_info: StreamerInfo;
  viewer_count: number;
  streaming_service: StreamingService;
  online: boolean;
  archivedStream?: VideoByUserIdResponse;
}


export interface StreamingService {
  name: string;
  base_url: string;
}

export const Glimesh: StreamingService = {
  name: "Glimesh",
  base_url: "https://glimesh.tv/"
} as const

export const Twitch: StreamingService = {
  name: "Twitch",
  base_url: "https://twitch.tv/"
} as const

export interface StreamAnnouncementInfoResolver {
  resolve(): Promise<StreamAnnouncementInfo>;
}

export class TwitchStreamAnnouncementInfoResolver
  implements StreamAnnouncementInfoResolver
{
  constructor(private streamInfo: StreamInfo) {}

  async resolve(): Promise<StreamAnnouncementInfo> {
    const streamer = await UserManager.getUserAsStreamerInfoById(this.streamInfo.user_id);
    let category = await fetchGameById(this.streamInfo.game_id);
    if (!category) {
      category = { name: "" };
    }
    const started_at = new Date(this.streamInfo.started_at);

    return {
      category_name: category.name,
      id: this.streamInfo.id,
      language: this.streamInfo.language,
      online:true,
      started_at: started_at,
      streamer_info: streamer,
      streaming_service: Twitch,
      thumbnail_url: this.streamInfo.thumbnail_url,
      title: this.streamInfo.title,
      viewer_count: this.streamInfo.viewer_count,
    };
  }
}

export class TwitchStreamOfflineAnnouncementInfoResolver
  implements StreamAnnouncementInfoResolver
{
  constructor(private member_id: string, private video: VideoByUserIdResponse) {}

  async resolve(): Promise<StreamAnnouncementInfo> {
    const streamer = await UserManager.getUserAsStreamerInfoById(this.member_id);
    
    return {
      archivedStream: this.video,
      category_name: "not used",
      id: "notused",
      language: "notused",
      online: false,
      started_at: new Date(), // not used
      streamer_info: streamer,
      streaming_service: Twitch,
      thumbnail_url: this.video?.thumbnail_url,
      title: this.video?.title,
      viewer_count: 0, // not used
    };
  }
}

export class GlimeshStreamAnnouncementInfoResolver
  implements StreamAnnouncementInfoResolver
{
  constructor(private streamInfo: GlimeshStreamInfo) {}
  
  async resolve(): Promise<StreamAnnouncementInfo> {
    return {
      category_name: this.streamInfo.stream?.category.name,
      id: this.streamInfo.id,
      language: this.streamInfo.language,
      online: this.streamInfo.status === "LIVE",
      started_at: this.streamInfo.stream ? new Date(this.streamInfo.stream.startedAt) : new Date(),
      streamer_info: {
        avatar_url: this.streamInfo.streamer.avatarUrl,
        display_name: this.streamInfo.streamer.displayname,
        id: this.streamInfo.streamer.username,
        name: this.streamInfo.streamer.username,
      },
      streaming_service: Glimesh,
      thumbnail_url: this.streamInfo.stream?.thumbnail,
      title: this.streamInfo.title,
      viewer_count: this.streamInfo.stream?.avgViewers,
    };
  }
}
export interface GlimeshStreamInfo {
  id:       string;
  language: string;
  status:   string;
  stream:   GlimeshStream;
  streamer: GlimeshStreamer;
  title:    string;
}

export interface GlimeshStream {
  avgViewers:  number;
  category:    GlimeshCategory;
  startedAt:   string;
  subcategory: GlimeshCategory;
  thumbnail:   string;
  title:       string;
}

export interface GlimeshCategory {
  name: string;
}

export interface GlimeshStreamer {
  avatarUrl:   string;
  displayname: string;
  username:    string;
}

export interface StreamerInfoResolver {
  resolve(): Promise<StreamerInfo>;
}

export interface StreamerInfo {
  id: string;
  name: string;
  display_name: string;
  avatar_url: string;
}

export interface StreamByBroadcasterIdResponse {
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
}

export enum ImageDrops {
  Contentful = "contentful",
  Partner = "partner",
  Battlesnake = "battlesnake",
}

export interface DiscordReactionRole {
  role_id: string;
  emoji_tag: string;
  message_id: string;
}

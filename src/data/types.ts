import { Badges } from "tmi.js";

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

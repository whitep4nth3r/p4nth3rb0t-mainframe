import axios from "axios";
import AccessToken from "../classes/AccessToken";
import type {
  GameByIdResponse,
  StreamByBroadcasterIdResponse,
  VideoByUserIdResponse,
} from "../data/types";
import { config } from "../config";

const accessTokenUtil = new AccessToken();

export const getCurrentChatters = async (): Promise<any> => {
  const response = await axios.get(
    `https://tmi.twitch.tv/group/user/${config.broadcaster.name}/chatters`,
  );

  const { data } = response;
  const { chatters } = data;
  const { vips, moderators, staff, viewers } = chatters;

  return [...vips, ...moderators, ...moderators, ...staff, ...viewers];
};

export const fetchGameById = async (
  id: string,
): Promise<GameByIdResponse | null> => {
  const accessTokenData = await accessTokenUtil.get();
  if (!accessTokenData) return null;

  const response = await axios.get(
    `https://api.twitch.tv/helix/games?id=${id}`,
    {
      headers: {
        accept: "application/vnd.twitchtv.v5+json",
        "client-id": process.env.CLIENT_ID,
        authorization: `Bearer ${accessTokenData.accessToken}`,
      },
    },
  );

  return response.data.data[0];
};

export const fetchVideoByUserId = async (
  user_id: string,
): Promise<VideoByUserIdResponse | null> => {
  const accessTokenData = await accessTokenUtil.get();
  if (!accessTokenData) return null;

  const response = await axios.get(
    `https://api.twitch.tv/helix/videos?user_id=${user_id}&first=1`,
    {
      headers: {
        accept: "application/vnd.twitchtv.v5+json",
        "client-id": process.env.CLIENT_ID,
        authorization: `Bearer ${accessTokenData.accessToken}`,
      },
    },
  );

  return response.data.data[0];
};

export const getActiveBroadcasterStreamByBroadcasterId = async (
  user_id: string,
): Promise<StreamByBroadcasterIdResponse | null> => {
  const accessTokenData = await accessTokenUtil.get();
  if (!accessTokenData) return null;

  const response = await axios.get(
    `https://api.twitch.tv/helix/streams?user_id=${user_id}`,
    {
      headers: {
        accept: "application/vnd.twitchtv.v5+json",
        "client-id": process.env.CLIENT_ID,
        authorization: `Bearer ${accessTokenData.accessToken}`,
      },
    },
  );

  return response.data.data[0];
};

import axios, { AxiosResponse } from "axios";
import AccessToken from "../classes/AccessToken";
import type {
  TwitchAnnouncementColor,
  GameByIdResponse,
  StreamByBroadcasterIdResponse,
  VideoByUserIdResponse,
} from "../data/types";
import { config } from "../config";
import { UserAccessTokenData } from "../data/models/UserAccessToken";

const accessTokenUtil = new AccessToken();

export const getCurrentMods = async (): Promise<any> => {
  const response = await axios.get(
    `https://tmi.twitch.tv/group/user/${config.broadcaster.user_name}/chatters`,
  );

  const { data } = response;
  const { chatters } = data;
  const { moderators } = chatters;

  return moderators;
};
interface Chatter {
  user_id: string
  user_login: string
  user_name: string
}

interface CallResult {
  response: AxiosResponse<any> | undefined
  status: number
}

const attemptDoGet = async (url: string, token: UserAccessTokenData): Promise<CallResult> => {
  let status = 200;
  const response = await axios.get(url, clientAuthConfig(token)
  ).catch(function (error) {
    if (error.response) {
      status = error.response.status as number;
    } else {
      status = 400;
    }
    return undefined;
  });
  return { response: response, status: status }
}

const doGet = async (url: string): Promise<(AxiosResponse<any> | undefined)> => {
  let accessTokenData = await accessTokenUtil.getUserAccessToken();
  if (!accessTokenData) {
    console.error("Failed to acquire User Access Token");
    return;
  }
  let result = await attemptDoGet(url, accessTokenData);
  if (result.status == 401) {
    console.info("Token was not accepted. Trying to refresh it.");
    const ok = await accessTokenUtil.refreshUserAccessToken(accessTokenData);
    if (ok) {
      console.info("Refresh was successful. Loading the new token from storage.");
      accessTokenData = await accessTokenUtil.getUserAccessToken();
      if (!accessTokenData) {
        console.error("Failed to acquire User Access Token");
        return;
      }
      result = await attemptDoGet(url, accessTokenData);
    }
  }
  return result.response;
};

function clientAuthConfig(token: UserAccessTokenData) {
  return {
    headers: {
      "client-id": process.env.CLIENT_ID,
      authorization: `Bearer ${token.accessToken}`,
    },
  };
}

export const getCurrentChatters = async (): Promise<string[]> => {
  const url = `https://api.twitch.tv/helix/chat/chatters?first=1000&broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`;
  const response = await doGet(url);
  if (response) {
    const chatters = response.data.data;
    return (chatters as Chatter[]).map(d => {
      return d.user_name.toLowerCase()
    });
  }
  return [];
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

export const announce = async (message: string, color?: TwitchAnnouncementColor): Promise<any> => {
  const accessTokenData = await accessTokenUtil.getUserAccessToken();
  if (!accessTokenData) return null;

  await axios.post(
    `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.bot.user_id}`,
    {
      message,
      color,
    },
    {
      headers: {
        "client-id": process.env.CLIENT_ID,
        authorization: `Bearer ${accessTokenData.accessToken}`,
      },
    }
  );
};

export const ShoutOut = async (toBroadcaster: string): Promise<any> => {
  const accessTokenData = await accessTokenUtil.getUserAccessToken();
  if (!accessTokenData) return null;

  await axios.post(
    `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${config.broadcaster.user_id}&to_broadcaster_id=${toBroadcaster}&moderator_id=${config.bot.user_id}`,
    {
      headers: {
        "client-id": process.env.CLIENT_ID,
        authorization: `Bearer ${accessTokenData.accessToken}`,
      },
    }
  );
};

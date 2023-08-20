import axios, { AxiosResponse } from "axios";
import AccessToken from "../classes/AccessToken";
import type {
  TwitchAnnouncementColor,
  GameByIdResponse,
  StreamByBroadcasterIdResponse,
  TwitchUser,
  VideoByUserIdResponse,
} from "../data/types";
import { config } from "../config";
import { UserAccessTokenData } from "../data/models/UserAccessToken";

const accessTokenUtil = new AccessToken();

interface CallResult {
  response: AxiosResponse<any> | undefined;
  status: number;
}

export const getCurrentMods = async (): Promise<TwitchUser[]> => {
  const url = `https://api.twitch.tv/helix/moderation/moderators?first=100&broadcaster_id=${config.broadcaster.user_id}`;
  const response = await doGet(url);
  if (response) {
    const moderators = response.data.data;
    return moderators as TwitchUser[];
  }
  return [];
};

export const getCurrentChatters = async (): Promise<TwitchUser[]> => {
  const url = `https://api.twitch.tv/helix/chat/chatters?first=1000&broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`;
  const response = await doGet(url);
  if (response) {
    const chatters = response.data.data;
    return chatters as TwitchUser[];
  }
  return [];
};

export const getCurrentChatterUserNames = async (): Promise<string[]> => {
  const chatters = await getCurrentChatters();
  return chatters.map((d) => d.user_name.toLowerCase());
};

export const timeoutUserFor60Seconds = async (
  userId: string,
): Promise<void> => {
  const url = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`;
  const body = {
    data: {
      user_id: userId,
      duration: "60",
    },
  };
  const response = await doPost(url, body);
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

export const announce = async (
  message: string, 
  color?: TwitchAnnouncementColor,
): Promise<any> => {
  const url = `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`;
  const body = {
    message,
    color,
  }
  const response = await doPost(url, body);
  if (response) {
    console.log(`Successfully announced: ${message}`)
  }
};

const doGet = async (url: string): Promise<AxiosResponse<any> | undefined> => {
  const callable = async (token: UserAccessTokenData) => {
    return await attemptDoGet(url, token);
  };
  const result = await callWithUserAccessToken(callable);
  return result;
};

const doPost = async (
  url: string,
  body: any,
): Promise<AxiosResponse<any> | undefined> => {
  const callable = async (token: UserAccessTokenData) => {
    return await attemptDoPost(url, body, token);
  };
  const result = await callWithUserAccessToken(callable);
  return result;
};

const callWithUserAccessToken = async (
  callable: (token: UserAccessTokenData) => Promise<CallResult>,
) => {
  let accessTokenData = await accessTokenUtil.getUserAccessToken();
  if (!accessTokenData) {
    console.error("Failed to acquire User Access Token");
    return;
  }
  let result = await callable(accessTokenData);
  if (result.status == 401) {
    console.info("Token was not accepted. Trying to refresh it.");
    const ok = await accessTokenUtil.refreshUserAccessToken(accessTokenData);
    if (ok) {
      console.info(
        "Refresh was successful. Loading the new token from storage.",
      );
      accessTokenData = await accessTokenUtil.getUserAccessToken();
      if (!accessTokenData) {
        console.error("Failed to acquire User Access Token");
        return;
      }
      result = await callable(accessTokenData);
    }
  }
  return result.response;
};

const attemptDoGet = async (
  url: string,
  token: UserAccessTokenData,
): Promise<CallResult> => {
  let status = 200;
  const response = await axios
    .get(url, clientAuthConfig(token))
    .catch(function (error) {
      if (error.response) {
        status = error.response.status as number;
      } else {
        status = 400;
      }
      return undefined;
    });
  return { response, status };
};

const attemptDoPost = async (
  url: string,
  body: any,
  token: UserAccessTokenData,
): Promise<CallResult> => {
  let status = 200;
  const response = await axios
    .post(url, body, clientAuthConfig(token))
    .catch(function (error) {
      if (error.response) {
        status = error.response.status as number;
      } else {
        status = 400;
      }
      return undefined;
    });
  return { response, status };
};

const clientAuthConfig = (token: UserAccessTokenData) => {
  return {
    headers: {
      "client-id": process.env.CLIENT_ID,
      authorization: `Bearer ${token.accessToken}`,
    },
  };
};

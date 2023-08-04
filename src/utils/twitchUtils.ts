import axios, { AxiosResponse } from "axios";
import AccessToken from "../classes/AccessToken";
import type {
  GameByIdResponse,
  StreamByBroadcasterIdResponse,
  VideoByUserIdResponse,
} from "../data/types";
import { config } from "../config";
import { UserAccessTokenData } from "../data/models/UserAccessToken";

const accessTokenUtil = new AccessToken();

export interface Chatter {
  user_id: string
  user_login: string
  user_name: string
}

interface CallResult {
  response: AxiosResponse<any> | undefined
  status: number
}

export const getCurrentMods = async (): Promise<Chatter[]> => {
  const url = `https://api.twitch.tv/helix/moderation/moderators?first=100&broadcaster_id=${config.broadcaster.user_id}`;
  const response = await doGet(url);
  if (response) {
    const moderators = response.data.data;
    return moderators as Chatter[];
  }
  return [];
};

export const getCurrentChatters = async (): Promise<Chatter[]> => {
  const url = `https://api.twitch.tv/helix/chat/chatters?first=1000&broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`;
  const response = await doGet(url);
  if (response) {
    const chatters = response.data.data;
    return chatters as Chatter[];
  }
  return [];
};

export const getCurrentChatterUserNames = async (): Promise<string[]> => {
  const chatters = await getCurrentChatters();
  return chatters.map(d => {
    return d.user_name.toLowerCase()
  });
};

export const banUser = async (userId: string): Promise<void> => {
  const url = `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`;
  const body = {
    data: {
      user_id: userId,
      duration: "60"
    }
  }
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

export const announce = async (): Promise<any> => {
  // get user access token for p4nth3rb0t ID
  // scope moderator:manage:announcements
  // moderator_id passed in should be p4nth3rb0t ID

  // docs https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#authorization-code-grant-flow

  // generate RANDOM_GENERATED_STRING

  // go to web browser
  // log in as p4nth3rb0t to twitch
  // go to:  https://id.twitch.tv/oauth2/authorize?client_id={CLIENT_ID}&response_type=code&scope=moderator:manage:announcements&state={RANDOM_GENERATED_STRING}

  // then check for random generated string in response before proceeding

  // if string matches, we are authorized and good to proceed to next steps:

  // https://api.twitch.tv/helix/chat/announcements?broadcaster_id={whitep4nth3r}&moderator_id={p4nth3rb0t} POST
  // send in body
  // message string
  // color string
  /** blue green orange purple primary (default) */
};

const doGet = async (url: string): Promise<(AxiosResponse<any> | undefined)> => {
  let callable = async (token: UserAccessTokenData) => {
    return await attemptDoGet(url, token);
  }
  let result = await callWithUserAccessToken(callable);
  return result;
};

const doPost = async (url: string, body: any): Promise<(AxiosResponse<any> | undefined)> => {
  let callable = async (token: UserAccessTokenData) => {
    return await attemptDoPost(url, body, token);
  }
  let result = await callWithUserAccessToken(callable);
  return undefined;
};

const callWithUserAccessToken = async (callable: (token: UserAccessTokenData) => Promise<CallResult>) => {
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
      console.info("Refresh was successful. Loading the new token from storage.");
      accessTokenData = await accessTokenUtil.getUserAccessToken();
      if (!accessTokenData) {
        console.error("Failed to acquire User Access Token");
        return;
      }
      result = await callable(accessTokenData);
    }
  }
  return result.response;
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

const attemptDoPost = async (url: string, body: any, token: UserAccessTokenData): Promise<CallResult> => {
  let status = 200;
  const response = await axios.post(url, body, clientAuthConfig(token)
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

const clientAuthConfig = (token: UserAccessTokenData) => {
  return {
    headers: {
      "client-id": process.env.CLIENT_ID,
      authorization: `Bearer ${token.accessToken}`,
    },
  };
}

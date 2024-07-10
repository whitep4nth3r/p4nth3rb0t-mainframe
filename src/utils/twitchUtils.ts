import * as Sentry from "@sentry/node";
import AccessToken from "../classes/AccessToken";
import type {
  TwitchAnnouncementColor,
  GameByIdResponse,
  StreamByBroadcasterIdResponse,
  TwitchRaidResponse,
  TwitchUser,
  TwitchVideo,
  StartRaidResponse,
  TwitchModeratorsResponse,
  TwitchCurrentChattersResponse,
  TwitchGameResponse,
} from "../data/types";
import { config } from "../config";
import { UserAccessTokenData } from "../data/models/UserAccessToken";

const accessTokenUtil = new AccessToken();

interface CallResult {
  response: Response | undefined;
  status: number;
}

export const startRaid = async (
  to_broadcaster_id: string,
): Promise<StartRaidResponse> => {
  const response = await doPost(
    `https://api.twitch.tv/helix/raids?from_broadcaster_id=${config.broadcaster.user_id}&to_broadcaster_id=${to_broadcaster_id}`,
    null
  );

  if (response) {
    const twitchData = await response.json() as TwitchRaidResponse;

    return {
      status: response.status,
      data: twitchData.data,
    };
  }

  return {
    status: 500,
    data: [],
  };
};

export const getCurrentMods = async (): Promise<TwitchUser[]> => {
  const response = await doGet(
    `https://api.twitch.tv/helix/moderation/moderators?first=100&broadcaster_id=${config.broadcaster.user_id}`
  );

  if (response) {
    const responseData = await response.json() as TwitchModeratorsResponse;
    const moderators = responseData.data;

    return moderators as TwitchUser[];
  }

  return [];
};

export const getCurrentChatters = async (): Promise<TwitchUser[]> => {
  const response = await doGet(
    `https://api.twitch.tv/helix/chat/chatters?first=1000&broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`
  );

  if (response) {
    const responseData = await response.json() as TwitchCurrentChattersResponse;
    const chatters = responseData.data;
    
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
  const body = {
    data: {
      user_id: userId,
      duration: "60",
    },
  };
  
  await doPost(
    `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`,
    body
  );
};

export const fetchGameById = async (
  id: string,
): Promise<GameByIdResponse | null> => {
  const accessTokenData = await accessTokenUtil.get();
  if (!accessTokenData) {
    return null;
  }

  const response = await fetch(
    `https://api.twitch.tv/helix/games?id=${id}`,
    {
      headers: {
        "Client-Id": process.env.CLIENT_ID,
        "Authorization": `Bearer ${accessTokenData.accessToken}`,
      },
    },
  );

  if (response.ok) {
    const responseData = await response.json() as TwitchGameResponse;

    return responseData.data[0];
  }

  return null;
};

export const fetchVideoByUserId = async (
  user_id: string,
): Promise<TwitchVideo | null> => {
  const accessTokenData = await accessTokenUtil.get();
  if (!accessTokenData) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/videos?user_id=${user_id}&first=1`,
      {
        headers: {
          "Client-Id": process.env.CLIENT_ID,
          "Authorization": `Bearer ${accessTokenData.accessToken}`,
        },
      },
    );

    if (response.ok) {
      const responseData = await response.json() as TwitchVideo;

      return responseData.data[0];
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};

export const getActiveBroadcasterStreamByBroadcasterId = async (
  user_id: string,
): Promise<StreamByBroadcasterIdResponse | null> => {
  const accessTokenData = await accessTokenUtil.get();
  if (!accessTokenData) {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.twitch.tv/helix/streams?user_id=${user_id}`,
      {
        headers: {
          "Client-Id": process.env.CLIENT_ID,
          "Authorization": `Bearer ${accessTokenData.accessToken}`,
        },
      },
    );

    if (response.ok) {
      const responseData = await response.json() as StreamByBroadcasterIdResponse;

      return responseData.data[0];
    }
  } catch (error) {
    console.log(error);
  }

  return null;
};

export const announce = async (
  message: string,
  color?: TwitchAnnouncementColor,
): Promise<any> => {
  const url = `https://api.twitch.tv/helix/chat/announcements?broadcaster_id=${config.broadcaster.user_id}&moderator_id=${config.broadcaster.user_id}`;
  const body = {
    message,
    color,
  };

  const response = await doPost(url, body);

  if (response) {
    console.log(`Successfully announced: ${message}`);
  } else {
    Sentry.captureException(`Failed to announce ${message}`);
  }
};

export const shoutOut = async (toBroadcasterId: string): Promise<any> => {
  const url = `https://api.twitch.tv/helix/chat/shoutouts?from_broadcaster_id=${config.broadcaster.user_id}&to_broadcaster_id=${toBroadcasterId}&moderator_id=${config.broadcaster.user_id}`;
  const response = await doPost(url, null);

  if (response) {
    console.log(`Shoutout to ${toBroadcasterId}`);
  } else {
    Sentry.captureException(`Failed to shoutout ${toBroadcasterId}`);
  }
};

const doGet = async (url: string): Promise<Response | undefined> => {
  const callable = async (token: UserAccessTokenData) => {
    return await attemptDoGet(url, token);
  };

  const result = await callWithUserAccessToken(callable);

  return result;
};

const doPost = async (
  url: string,
  body: unknown,
): Promise<Response | undefined> => {
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
    Sentry.captureMessage("Failed to acquire User Access Token");
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
        Sentry.captureMessage("Failed to acquire User Access Token");
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

  const response = await fetch(url, clientAuthConfig(token)).catch(function (error) {
    status = error.response ? error.response.status : 400;

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

  const response = await fetch(url, {
    method: "POST",
    headers: {
      ...clientAuthConfig(token).headers,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  }).catch(function (error) {
    status = error.response ? error.response.status : 400;

    return undefined;
  });

  return { response, status };
};

const clientAuthConfig = (token: UserAccessTokenData) => {
  return {
    headers: {
      "Client-Id": process.env.CLIENT_ID,
      "Authorization": `Bearer ${token.accessToken}`,
    },
  };
};

export async function validateTwitchSession(accessToken: string) {
  const validateSession = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: {
      "Authorization": `OAuth ${accessToken}`,
    },
  });

  const validateSessionData: any = await validateSession.json();
  return validateSessionData;
}

import * as Sentry from "@sentry/node";
import { database } from "../data/database";
import AccessToken from "../classes/AccessToken";
import {
  StartRaidResponse,
  StreamByBroadcasterIdResponse,
  TwitchAnnouncementColor,
  TwitchCurrentChattersResponse,
  TwitchModeratorsResponse,
  TwitchRaidResponse,
  TwitchUser,
  TwitchVideo,
  TwitchVideoResponse,
} from "../data/types";
import { config } from "../config";
import { UserAccessToken } from "../data/entities/UserAccessTokenEntity";

const userAccessTokenRepository = database.getRepository(UserAccessToken);

export const startRaid = async (
  to_broadcaster_id: string,
): Promise<StartRaidResponse> => {
  const response = await callWithUserAccessToken(async (token) => {
    const params = new URLSearchParams({
      from_broadcaster_id: config.broadcaster.user_id,
      to_broadcaster_id: to_broadcaster_id,
    });

    return await fetch(`https://api.twitch.tv/helix/raids?${params}`, {
      method: "POST",
      headers: {
        ...clientAuthConfig(token).headers,
        "Content-Type": "application/json",
      },
    });
  });

  if (response) {
    const twitchData = (await response.json()) as TwitchRaidResponse;

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
  const response = await callWithUserAccessToken(async (token) => {
    const params = new URLSearchParams({
      first: "100",
      broadcaster_id: config.broadcaster.user_id,
    });

    return await fetch(
      `https://api.twitch.tv/helix/moderation/moderators?${params}`,
      {
        method: "GET",
        headers: {
          ...clientAuthConfig(token).headers,
          "Content-Type": "application/json",
        },
      },
    );
  });

  if (response) {
    const responseData = (await response.json()) as TwitchModeratorsResponse;

    return responseData.data as TwitchUser[];
  }

  return [];
};

export const getCurrentChatters = async (): Promise<TwitchUser[]> => {
  const response = await callWithUserAccessToken(async (token) => {
    const params = new URLSearchParams({
      first: "1000",
      broadcaster_id: config.broadcaster.user_id,
      moderator_id: config.broadcaster.user_id,
    });

    return await fetch(`https://api.twitch.tv/helix/chat/chatters?${params}`, {
      method: "GET",
      headers: {
        ...clientAuthConfig(token).headers,
        "Content-Type": "application/json",
      },
    });
  });

  if (response) {
    const responseData =
      (await response.json()) as TwitchCurrentChattersResponse;

    return responseData.data as TwitchUser[];
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

  await callWithUserAccessToken(async (token) => {
    const params = new URLSearchParams({
      broadcaster_id: config.broadcaster.user_id,
      moderator_id: config.broadcaster.user_id,
    });

    return await fetch(
      `https://api.twitch.tv/helix/moderation/bans?${params}`,
      {
        method: "POST",
        headers: {
          ...clientAuthConfig(token).headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
  });
};

export const fetchVideoByUserId = async (
  user_id: string,
): Promise<TwitchVideo | null> => {
  const response = await callWithUserAccessToken(async (token) => {
    const params = new URLSearchParams({
      user_id: user_id,
      first: "1",
    });

    return await fetch(`https://api.twitch.tv/helix/videos?${params}`, {
      method: "GET",
      headers: {
        ...clientAuthConfig(token).headers,
        "Content-Type": "application/json",
      },
    });
  });

  if (response && response.ok) {
    const responseData = (await response.json()) as TwitchVideoResponse;

    return responseData.data[0] as TwitchVideo;
  }

  return null;
};

export const getActiveBroadcasterStreamByBroadcasterId = async (
  user_id: string,
): Promise<StreamByBroadcasterIdResponse | null> => {
  const response = await callWithUserAccessToken(async (token) => {
    const params = new URLSearchParams({
      user_id: user_id,
    });

    return await fetch(`https://api.twitch.tv/helix/streams?${params}`, {
      method: "GET",
      headers: {
        ...clientAuthConfig(token).headers,
        "Content-Type": "application/json",
      },
    });
  });

  if (response && response.ok) {
    return (await response.json()) as StreamByBroadcasterIdResponse;
  }

  return null;
};

export const announce = async (
  message: string,
  color?: TwitchAnnouncementColor,
): Promise<any> => {
  const body = {
    message,
    color,
  };

  const response = await callWithUserAccessToken(async (token) => {
    const params = new URLSearchParams({
      broadcaster_id: config.broadcaster.user_id,
      moderator_id: config.broadcaster.user_id,
    });

    return await fetch(
      `https://api.twitch.tv/helix/chat/announcements?${params}`,
      {
        method: "POST",
        headers: {
          ...clientAuthConfig(token).headers,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      },
    );
  });

  if (response) {
    console.log(`Successfully announced: ${message}`);
  } else {
    console.error(`Failed to announce ${message}`);
    Sentry.captureException(`Failed to announce ${message}`);
  }
};

export const shoutOut = async (toBroadcasterId: string): Promise<any> => {
  const response = await callWithUserAccessToken(async (token) => {
    const params = new URLSearchParams({
      from_broadcaster_id: config.broadcaster.user_id,
      to_broadcaster_id: toBroadcasterId,
      moderator_id: config.broadcaster.user_id,
    });

    return await fetch(`https://api.twitch.tv/helix/chat/shoutouts?${params}`, {
      method: "POST",
      headers: {
        ...clientAuthConfig(token).headers,
        "Content-Type": "application/json",
      },
    });
  });

  if (response) {
    console.log(`Shoutout to ${toBroadcasterId}`);
  } else {
    console.error(`Failed to shoutout ${toBroadcasterId}`);
    Sentry.captureException(`Failed to shoutout ${toBroadcasterId}`);
  }
};

const callWithUserAccessToken = async (
  callable: (token: UserAccessToken) => Promise<Response>,
): Promise<Response | undefined> => {
  const accessTokenUtil = new AccessToken();

  let accessTokenData = await accessTokenUtil.getUserAccessToken();

  if (!accessTokenData) {
    Sentry.captureMessage("Failed to acquire User Access Token");
    console.error("Failed to acquire User Access Token");

    return undefined;
  }

  let response = await callable(accessTokenData);

  if (response.status === 401) {
    console.info("Token was not accepted. Trying to refresh it.");

    const ok = await accessTokenUtil.refreshUserAccessToken(accessTokenData);

    if (ok) {
      console.info(
        "Refresh was successful. Loading the new token from storage.",
      );

      accessTokenData = await userAccessTokenRepository.findOneBy({});

      if (!accessTokenData) {
        Sentry.captureMessage("Failed to acquire User Access Token");
        console.error("Failed to acquire User Access Token");

        return undefined;
      }

      response = await callable(accessTokenData);
    }
  }

  return response;
};

const clientAuthConfig = (token: UserAccessToken) => {
  return {
    headers: {
      "Client-Id": process.env.CLIENT_ID,
      Authorization: `Bearer ${token.accessToken}`,
    },
  };
};

export async function validateTwitchSession(accessToken: string) {
  const validateSession = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: {
      Authorization: `OAuth ${accessToken}`,
    },
  });

  return await validateSession.json();
}

import * as Sentry from "@sentry/node";
import AccessToken from "../classes/AccessToken";
import {
  TeamMembers,
  TeamResponse,
  TwitchChannel,
  TwitchChannelResponse,
} from "../data/types";
import { config } from "../config";

const accessTokenUtil = new AccessToken();

export default class Team {
  static cache: TeamMembers = [];

  static getWelcomeMessage = (channel: TwitchChannel): string => {
    return config.teamWelcomeMessage(channel);
  };

  static async getChannelById(
    broadcasterId: string,
  ): Promise<TwitchChannel | undefined> {
    const accessTokenData = await accessTokenUtil.get();

    if (accessTokenData) {
      try {
        const params = new URLSearchParams({
          broadcaster_id: broadcasterId,
        });

        const response = await fetch(
          `https://api.twitch.tv/helix/channels?${params}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessTokenData.accessToken}`,
              "Client-Id": process.env.CLIENT_ID,
            },
          },
        );

        if (response && response.ok) {
          const responseData = (await response.json()) as TwitchChannelResponse;

          return responseData.data[0];
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }

    return undefined;
  }

  static async getMembers(): Promise<any> {
    if (Team.cache.length > 0) {
      return Team.cache;
    }

    const accessTokenData = await accessTokenUtil.get();

    if (accessTokenData) {
      try {
        const params = new URLSearchParams({
          name: config.team.name,
        });

        const response = await fetch(
          `https://api.twitch.tv/helix/teams?${params}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessTokenData.accessToken}`,
              "Client-Id": process.env.CLIENT_ID,
            },
          },
        );

        if (response.ok) {
          const data = (await response.json()) as TeamResponse;

          Team.cache = data.data[0].users;

          return data.data[0].users;
        }
      } catch (error) {
        Sentry.captureException(error);
      }
    }

    return null;
  }
}

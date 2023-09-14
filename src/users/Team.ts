import * as Sentry from "@sentry/node";
import axios from "axios";
import AccessToken from "../classes/AccessToken";
import { TwitchChannel, TeamResponse, TeamMembers } from "../data/types";
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
        const response = await axios.get<{ data: TwitchChannel[] }>(
          `https://api.twitch.tv/helix/channels?broadcaster_id=${broadcasterId}`,
          {
            headers: {
              authorization: `Bearer ${accessTokenData.accessToken}`,
              "client-id": process.env.CLIENT_ID,
            },
          },
        );

        return response.data.data[0];
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
        const response = await axios.get<TeamResponse>(
          `https://api.twitch.tv/helix/teams?name=${config.team.name}`,
          {
            headers: {
              Authorization: `Bearer ${accessTokenData.accessToken}`,
              "client-id": process.env.CLIENT_ID,
            },
          },
        );

        Team.cache = response.data.data[0].users;

        return response.data.data[0].users;
      } catch (error) {
        Sentry.captureException(error);
      }
    }

    return null;
  }
}

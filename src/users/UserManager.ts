import AccessToken from "../classes/AccessToken";
import { FullTwitchUser, TwitchUserResponse } from "../data/types";
import { tmi } from "../tmi";
import { config } from "../config";

const accessTokenUtil = new AccessToken();

const accountIsOlderThanSevenDays = (createdAt: string): boolean => {
  const SEVEN_DAYS = 604800;
  const accountCreated = new Date(createdAt).valueOf();
  const accountCreatedEpoch = accountCreated / 1000;
  const now = new Date().valueOf();
  const epoch = now / 1000;

  return epoch - accountCreatedEpoch > SEVEN_DAYS;
};

export default class UserManager {
  static cache = new Map<string, any>();

  static async getUserByLogin(
    login: string,
  ): Promise<FullTwitchUser | undefined> {
    if (this.cache.has(login)) {
      const data = this.cache.get(login);
      const passesAgeCheck = accountIsOlderThanSevenDays(data.created_at);

      if (!passesAgeCheck) {
        data.profile_image_url = "";
      }

      return data;
    }

    const accessTokenData = await accessTokenUtil.get();

    if (accessTokenData) {
      const params = new URLSearchParams({
        login: login,
      });

      const response = await fetch(
        `https://api.twitch.tv/helix/users?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessTokenData.accessToken}`,
            "Client-Id": process.env.CLIENT_ID,
          },
        },
      );

      if (response.ok) {
        const responseData = (await response.json()) as TwitchUserResponse;

        if (responseData.data.length === 0) {
          tmi.say(config.channel, "User not found, try again!");
          return undefined;
        }

        this.cache.set(login, responseData.data[0]);

        const passesAgeCheck = accountIsOlderThanSevenDays(
          responseData.data[0].created_at,
        );

        if (!passesAgeCheck) {
          responseData.data[0].profile_image_url = "";
        }

        return responseData.data[0];
      }
    }

    return undefined;
  }

  static async getUserById(
    userId: string,
  ): Promise<FullTwitchUser | undefined> {
    if (userId === undefined) {
      return undefined;
    }
    if (this.cache.has(userId)) {
      const data = this.cache.get(userId);
      if (data) {
        const passesAgeCheck = accountIsOlderThanSevenDays(data.created_at);

        if (!passesAgeCheck) {
          data.profile_image_url = "";
        }

        return data;
      }
    }

    const accessTokenData = await accessTokenUtil.get();

    if (accessTokenData) {
      const params = new URLSearchParams({
        id: userId,
      });

      const response = await fetch(
        `https://api.twitch.tv/helix/users?${params}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessTokenData.accessToken}`,
            "Client-Id": process.env.CLIENT_ID,
          },
        },
      );

      if (response.ok) {
        const responseData = (await response.json()) as TwitchUserResponse;

        this.cache.set(userId, responseData.data[0]);

        const passesAgeCheck = accountIsOlderThanSevenDays(
          responseData.data[0].created_at,
        );

        if (!passesAgeCheck) {
          responseData.data[0].profile_image_url = "";
        }

        return responseData.data[0];
      }
    }

    return undefined;
  }
}

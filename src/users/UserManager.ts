import axios from "axios";
import AccessToken from "../classes/AccessToken";
import { FullTwitchUser } from "../data/types";

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
      const response = await axios.get(
        `https://api.twitch.tv/helix/users?login=${login}`,
        {
          headers: {
            authorization: `Bearer ${accessTokenData.accessToken}`,
            "client-id": process.env.CLIENT_ID,
          },
        },
      );

      this.cache.set(login, response.data.data[0]);

      const passesAgeCheck = accountIsOlderThanSevenDays(
        response.data.data[0].created_at,
      );

      if (!passesAgeCheck) {
        response.data.data[0].profile_image_url = "";
      }

      return response.data.data[0];
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
      const passesAgeCheck = accountIsOlderThanSevenDays(data.created_at);

      if (!passesAgeCheck) {
        data.profile_image_url = "";
      }

      return data;
    }

    const accessTokenData = await accessTokenUtil.get();

    if (accessTokenData) {
      const response = await axios.get(
        `https://api.twitch.tv/helix/users?id=${userId}`,
        {
          headers: {
            authorization: `Bearer ${accessTokenData.accessToken}`,
            "client-id": process.env.CLIENT_ID,
          },
        },
      );

      this.cache.set(userId, response.data.data[0]);

      const passesAgeCheck = accountIsOlderThanSevenDays(
        response.data.data[0].created_at,
      );

      if (!passesAgeCheck) {
        response.data.data[0].profile_image_url = "";
      }

      return response.data.data[0];
    }
    return undefined;
  }
}

import axios from "axios";
import { UserByLoginResponse, UserByIdResponse, StreamerInfo } from "../data/types";

const accountIsOlderThanSevenDays = (createdAt: string): boolean => {
  const SEVEN_DAYS = 604800;
  const accountCreated = new Date(createdAt).valueOf();
  const accountCreatedEpoch = accountCreated / 1000;
  const now = new Date().valueOf();
  const epoch = now / 1000;

  return epoch - accountCreatedEpoch > SEVEN_DAYS;
};

// TODO - Fix cache for user by login
// it was never working anyway

export default class UserManager {
  static cache = new Map<string, any>();

  static async getUserByLogin(login: string): Promise<UserByLoginResponse> {
    const response = await axios.get(
      `https://api.twitch.tv/kraken/users?login=${login}`,
      {
        headers: {
          accept: "application/vnd.twitchtv.v5+json",
          "client-id": process.env.CLIENT_ID,
        },
      },
    );

    const passesAgeCheck = accountIsOlderThanSevenDays(
      response.data.users[0].created_at,
    );

    if (!passesAgeCheck) {
      response.data.users[0].logo = "";
    }

    return response.data;
  }
  static async getUserAsStreamerInfoById(userId: string): Promise<StreamerInfo> {
    const twitchUser = await this.getUserById(userId);
    return {
        id: twitchUser._id,
        name: twitchUser.name,
        display_name: twitchUser.display_name,
        avatar_url: twitchUser.logo,
      };
  }

  static async getUserById(userId: string): Promise<UserByIdResponse> {
    if (this.cache.has(userId)) {
      const data = this.cache.get(userId);
      const passesAgeCheck = accountIsOlderThanSevenDays(data.created_at);

      if (!passesAgeCheck) {
        data.logo = "";
      }

      return data;
    }

    const response = await axios.get(
      `https://api.twitch.tv/kraken/users/${userId}`,
      {
        headers: {
          accept: "application/vnd.twitchtv.v5+json",
          "client-id": process.env.CLIENT_ID,
        },
      },
    );

    this.cache.set(userId, response.data);

    const passesAgeCheck = accountIsOlderThanSevenDays(
      response.data.created_at,
    );

    if (!passesAgeCheck) {
      response.data.logo = "";
    }

    return response.data;
  }
}

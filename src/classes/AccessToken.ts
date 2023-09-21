import * as Sentry from "@sentry/node";
import axios from "axios";
import AccessTokenModel, {
  AccessTokenDoc,
  AccessTokenData,
} from "../data/models/AccessToken";
import AuthCodeModel from "../data/models/AuthCode";
import UserAccessTokenModel, {
  UserAccessTokenDoc,
  UserAccessTokenData,
} from "../data/models/UserAccessToken";
import {
  AccessTokenResponse,
  AuthCodeResponse,
  UserAccessTokenResponse,
} from "../data/types";
import { tmi } from "../tmi";
import { config } from "../config";
import { URLSearchParams } from "url";

export const USER_SCOPES: string[] = [
  "moderator:read:chatters",
  "moderation:read",
  "moderator:read:followers",
  "moderator:manage:banned_users",
  "moderator:manage:announcements",
  "moderator:manage:shoutouts",
];

export default class AccessToken {
  async getUserAccessToken(): Promise<UserAccessTokenData | undefined> {
    const cachedToken = await UserAccessTokenModel.findOne();
    if (cachedToken) {
      if (
        JSON.stringify(cachedToken.scope.sort()) ===
        JSON.stringify(USER_SCOPES.sort())
      ) {
        return cachedToken;
      } else {
        // Since the cached token has incorrect scope we need to clear it
        await UserAccessTokenModel.deleteOne();
        await this.announceMissingAuthCode();
      }
    } else {
      const authCode = await AuthCodeModel.findOne();
      if (!authCode) {
        await this.announceMissingAuthCode();
      } else {
        const token = await this.fetchUserAccessToken(authCode.code);
        if (token) {
          await this.setUserAccessToken(token);
          return (await UserAccessTokenModel.findOne()) || undefined;
        } else {
          await this.announceMissingAuthCode();
        }
      }
    }
  }

  async announceMissingAuthCode(): Promise<void> {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: process.env.CLIENT_ID || "",
      redirect_uri: process.env.AUTH_REDIRECT_URL || "",
      scope: USER_SCOPES.join(" "),
      state: "random-uuid",
    });
    await tmi.say(
      config.channel,
      `Doh, ${config.broadcaster.user_name} needs to (re)authorize me with Twitch!`,
    );
    console.log(
      `Please visit: https://id.twitch.tv/oauth2/authorize?${params}`,
    );
  }

  async refreshUserAccessToken(
    accessTokenData: UserAccessTokenData,
  ): Promise<boolean> {
    try {
      const params = {
        grant_type: "refresh_token",
        refresh_token: accessTokenData.refreshToken,
      };
      const token = await this.invokeTokenEndpoint(params);
      if (token) {
        await this.setUserAccessToken(token);
        return true;
      } else {
        // Most likely, Twitch did not accept the refresh token so should clear it
        const deleteResult = await UserAccessTokenModel.deleteOne();
        console.log(
          `Failed to refresh token. Cleared token from db: ${deleteResult}`,
        );
      }
    } catch (error: any) {
      Sentry.captureException(error);
    }
    return false;
  }

  /**
   * Returns an existing valid access token
   * or fetches a new one
   **/
  async get(): Promise<AccessTokenData | undefined> {
    const getAccessToken = await AccessTokenModel.findOne();

    const isValid =
      getAccessToken && (await this.checkExistsAndValid(getAccessToken));

    if (getAccessToken && isValid) {
      return getAccessToken;
    }

    const response = await this.fetch();

    if (response) {
      const accessToken = await this.set(response);
      return this.get();
    }
  }

  /**
   * 15/05/2020
   * Added | any to method signature due to mongoose update getting confused
   * Here's some reading about mongoose and TS: https://mongoosejs.com/docs/typescript.html
   * It recommends:
   *
   * "This approach works, but we recommend your document interface not extend Document. Using extends Document makes it difficult for Mongoose to infer which properties are present on query filters, lean documents, and other cases."
   * But how else would one interact with AccessTokenDoc unless it extends the Document signature?
   * */

  async set(data: AccessTokenResponse): Promise<AccessTokenDoc | any> {
    const setAccessToken = await AccessTokenModel.updateOne(
      {},
      {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        updatedAt: Math.floor(Date.now() / 1000),
      },
      { upsert: true },
    );

    return setAccessToken;
  }
  async setUserAccessToken(
    data: UserAccessTokenResponse,
  ): Promise<UserAccessTokenDoc | null> {
    await UserAccessTokenModel.updateOne(
      {},
      {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
        scope: data.scope,
        updatedAt: Math.floor(Date.now() / 1000),
      },
      { upsert: true },
    );

    return UserAccessTokenModel.findOne();
  }

  async setAuthCode(data: AuthCodeResponse): Promise<void> {
    await AuthCodeModel.updateOne(
      {},
      {
        code: data.code,
        scope: data.scope,
      },
      { upsert: true },
    );
  }

  async checkExistsAndValid(accessToken: AccessTokenData): Promise<boolean> {
    const { updatedAt, expiresIn } = accessToken;
    const timeNow = Math.floor(Date.now() / 1000);

    return updatedAt + expiresIn > timeNow;
  }

  async fetch(): Promise<AccessTokenResponse | undefined> {
    try {
      const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID || "",
        client_secret: process.env.CLIENT_SECRET || "",
        grant_type: "client_credentials",
        scope: "user:edit",
      });
      const response = await axios.post<AccessTokenResponse>(
        `https://id.twitch.tv/oauth2/token?${params}`,
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error);
    }

    return undefined;
  }
  async fetchUserAccessToken(
    code: string,
  ): Promise<UserAccessTokenResponse | undefined> {
    const params = {
      code: code,
      grant_type: "authorization_code",
      redirect_uri: process.env.AUTH_REDIRECT_URL,
    };
    return this.invokeTokenEndpoint(params);
  }

  async invokeTokenEndpoint(
    params: any,
  ): Promise<UserAccessTokenResponse | undefined> {
    try {
      const urlParams = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        ...params,
      });
      const response = await axios.post<UserAccessTokenResponse>(
        `https://id.twitch.tv/oauth2/token?${urlParams}`,
      );

      return response.data;
    } catch (error: any) {
      Sentry.captureException(error);
    }

    return undefined;
  }
}

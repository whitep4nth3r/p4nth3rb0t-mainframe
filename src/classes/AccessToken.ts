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
import { AccessTokenResponse, AuthCodeResponse, UserAccessTokenResponse } from "../data/types";
import { tmi } from "../tmi";
import { config } from "../config";
import { URLSearchParams } from "url";

export default class AccessToken {
  async getUserAccessToken(): Promise<UserAccessTokenData | undefined> {
    // TODO: Add parameter for 'scope' and verify cached auth code has same?
    const cachedToken = await UserAccessTokenModel.findOne();
    if (cachedToken) {
      return cachedToken;
    }
    const authCode = await AuthCodeModel.findOne();
    if (!authCode) {
      // @ts-ignore
      const params = new URLSearchParams({
        response_type: "code",
        client_id: process.env.CLIENT_ID,
        redirect_uri: process.env.AUTH_REDIRECT_URL,
        scope: "moderator:read:chatters",
        // TODO: Generate a random UUID and store in mongodb
        state: "random-uuid"
      });
      await tmi.say(config.channel, `Doh, ${config.broadcaster.user_name} needs to (re)authorize me with Twitch!`);
      console.log(`Please visit: https://id.twitch.tv/oauth2/authorize?${params}`);
    } else {
      const token = await this.fetchUserAccessToken(authCode.code);
      if (token) {
        await this.setUserAccessToken(token);
        return await UserAccessTokenModel.findOne() || undefined;
      }
    }

  }

  async refreshUserAccessToken(accessTokenData: UserAccessTokenData): Promise<boolean> {
    try {
      const params = {
        grant_type: "refresh_token",
        refresh_token: accessTokenData.refreshToken,
      };
      const token = await this.invokeTokenEndpoint(params)
      if (token) {
        await this.setUserAccessToken(token);
        return true;
      } else {
        // Most likely, Twitch did not accept the refresh token so should clear it
        const deleteResult = await UserAccessTokenModel.deleteOne();
        console.log(`Failed to refresh token. Cleared token from db: ${deleteResult}`)
      }
    } catch (error: any) {
      console.log(error);
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
  async setUserAccessToken(data: UserAccessTokenResponse): Promise<UserAccessTokenDoc | null> {
    await UserAccessTokenModel.updateOne(
      {},
      {
        accessToken: data.access_token,
        tokenType: data.token_type,
        expiresIn: data.expires_in,
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
      // @ts-ignore
      const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        grant_type: "client_credentials",
        scope: "user:edit",
      });
      const response = await axios.post<AccessTokenResponse>(
        `https://id.twitch.tv/oauth2/token?${params}`,
      );

      return response.data;
    } catch (error: any) {
      console.log(error);
    }

    return undefined;
  }
  async fetchUserAccessToken(code: string): Promise<UserAccessTokenResponse | undefined> {
    try {
      // @ts-ignore
      const params = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        code: code,
        grant_type: "authorization_code",
        redirect_uri: process.env.AUTH_REDIRECT_URL,
      });
      const response = await axios.post<UserAccessTokenResponse>(
        `https://id.twitch.tv/oauth2/token?${params}`,
      );

      return response.data;
    } catch (error: any) {
      console.log(error);
    }

    return undefined;
  }

  async invokeTokenEndpoint(params: any): Promise<UserAccessTokenResponse | undefined> {
    try {
      const urlParams = new URLSearchParams({
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET,
        ...params
      });
      const response = await axios.post<UserAccessTokenResponse>(
        `https://id.twitch.tv/oauth2/token?${urlParams}`,
      );

      return response.data;
    } catch (error: any) {
      console.log(error);
    }

    return undefined;
  }
}

import * as Sentry from "@sentry/node";
import { database } from "../data/database";
import { AccessToken as AccessTokenEntity } from "../data/entities/AccessTokenEntity";
import { UserAccessToken } from "../data/entities/UserAccessTokenEntity";
import { AuthCode } from "../data/entities/AuthCodeEntity";
import {
  AccessTokenResponse,
  AuthCodeResponse,
  UserAccessTokenResponse,
} from "../data/types";
import { URLSearchParams } from "url";
import { sendModChannelAuthorizeMessage } from "../discord";

export const USER_SCOPES: string[] = [
  "moderator:read:chatters",
  "moderation:read",
  "moderator:read:followers",
  "moderator:manage:banned_users",
  "moderator:manage:announcements",
  "moderator:manage:shoutouts",
  "channel:manage:raids",
  "channel:read:hype_train",
];

const accessTokenRepository = database.getRepository(AccessTokenEntity);
const userAccessTokenRepository = database.getRepository(UserAccessToken);
const authCodeRepository = database.getRepository(AuthCode);

export default class AccessToken {
  async getUserAccessToken(): Promise<UserAccessToken | undefined> {
    const cachedToken = await userAccessTokenRepository.findOneBy({});

    if (cachedToken) {
      if (
        JSON.stringify(cachedToken.scope.sort()) ===
        JSON.stringify(USER_SCOPES.sort())
      ) {
        return cachedToken;
      } else {
        // Since the cached token has incorrect scope we need to clear it
        await userAccessTokenRepository.remove(cachedToken);
        await this.announceMissingAuthCode();
      }
    } else {
      const authCode = await authCodeRepository.findOneBy({});
      if (!authCode) {
        await this.announceMissingAuthCode();
      } else {
        const token = await this.fetchUserAccessToken(authCode.code);
        if (token) {
          await this.setUserAccessToken(token);
          return await userAccessTokenRepository.findOneBy({});
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

    await sendModChannelAuthorizeMessage(
      `https://id.twitch.tv/oauth2/authorize?${params}`,
    );

    console.log(
      `Please visit: https://id.twitch.tv/oauth2/authorize?${params}`,
    );
  }

  async refreshUserAccessToken(accessTokenData: UserAccessToken): Promise<boolean> {
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
        await userAccessTokenRepository.remove(accessTokenData);
        console.log(
          `Failed to refresh token. The token is deleted from db.`
        );
      }
    } catch (error: any) {
      Sentry.captureException(error);
    }
    return false;
  }

  async get(): Promise<AccessTokenEntity | undefined> {
    const getAccessToken = await accessTokenRepository.findOneBy({});
    const isValid = getAccessToken && await this.checkExistsAndValid(getAccessToken);

    if (getAccessToken && isValid) {
      return getAccessToken;
    }

    try {
      const response = await this.fetch();

      if (response) {
        await this.set(response);

        return this.get();
      }
    } catch (error) {
      Sentry.captureException(error);
    }
  }

  async set(data: AccessTokenResponse): Promise<AccessTokenEntity> {
    let accessToken = await accessTokenRepository.findOneBy({});

    if (!accessToken) {
      accessToken = accessTokenRepository.create();
    }

    accessToken.accessToken = data.access_token;
    accessToken.tokenType = data.token_type;
    accessToken.expiresIn = data.expires_in;

    return accessTokenRepository.save(accessToken);
  }

  async setUserAccessToken(data: UserAccessTokenResponse): Promise<UserAccessToken> {
    let userAccessToken = await userAccessTokenRepository.findOneBy({});
    if (!userAccessToken) {
      userAccessToken = userAccessTokenRepository.create();
    }

    userAccessToken.accessToken = data.access_token;
    userAccessToken.refreshToken = data.refresh_token;
    userAccessToken.tokenType = data.token_type;
    userAccessToken.expiresIn = data.expires_in;
    userAccessToken.scope = data.scope;

    return userAccessTokenRepository.save(userAccessToken);
  }

  async setAuthCode(data: AuthCodeResponse): Promise<AuthCode> {
    let authCode = await authCodeRepository.findOneBy({});
    if (!authCode) {
      authCode = authCodeRepository.create();
    }

    authCode.code = data.code;
    authCode.scope = data.scope;
    authCode.updatedAt = new Date();

    return authCodeRepository.save(authCode);
  }

  async checkExistsAndValid(accessToken: AccessTokenEntity): Promise<boolean> {
    const { updatedAt, expiresIn } = accessToken;
    const timeNow = Math.floor(Date.now() / 1000);

    return updatedAt.getTime() / 1000 + expiresIn > timeNow;
  }

  async fetch(): Promise<AccessTokenResponse | undefined> {
    const params = new URLSearchParams({
      client_id: process.env.CLIENT_ID || "",
      client_secret: process.env.CLIENT_SECRET || "",
      grant_type: "client_credentials",
      scope: "user:edit",
    });

    try {
      const response = await fetch(
        `https://id.twitch.tv/oauth2/token?${params}`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        return await response.json() as AccessTokenResponse;
      }
    } catch (error: any) {
      Sentry.captureException(error);
    }

    return undefined;
  }

  async fetchUserAccessToken(code: string): Promise<UserAccessTokenResponse | undefined> {
    const params = {
      code: code,
      grant_type: "authorization_code",
      redirect_uri: process.env.AUTH_REDIRECT_URL,
    };

    return this.invokeTokenEndpoint(params);
  }

  async invokeTokenEndpoint(params: any): Promise<UserAccessTokenResponse | undefined> {
    const urlParams = new URLSearchParams({
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      ...params,
    });

    try {
      const response = await fetch(
        `https://id.twitch.tv/oauth2/token?${urlParams}`,
        {
          method: "POST",
        },
      );

      if (response.ok) {
        return await response.json() as UserAccessTokenResponse;
      }
    } catch (error: any) {
      Sentry.captureException(error);
    }

    return undefined;
  }
}

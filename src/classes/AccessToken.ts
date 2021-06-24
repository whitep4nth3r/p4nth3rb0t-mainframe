import axios from "axios";
import AccessTokenModel, {
  AccessTokenDoc,
  AccessTokenData,
} from "../data/models/AccessToken";
import { AccessTokenResponse } from "../data/types";

export default class AccessToken {
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

  async checkExistsAndValid(accessToken: AccessTokenData): Promise<boolean> {
    const { updatedAt, expiresIn } = accessToken;
    const timeNow = Math.floor(Date.now() / 1000);

    return updatedAt + expiresIn > timeNow;
  }

  async fetch(): Promise<AccessTokenResponse | undefined> {
    try {
      const response = await axios.post<AccessTokenResponse>(
        `https://id.twitch.tv/oauth2/token?scope=user:edit&response_type=token&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials&client_id=${process.env.CLIENT_ID}`,
        {
          headers: {
            accept: "application/vnd.twitchtv.v5+json",
          },
        },
      );

      return response.data;
    } catch (error) {
      console.log(error);
    }

    return undefined;
  }
}

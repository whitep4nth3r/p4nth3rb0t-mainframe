import axios from "axios";
import AccessToken from "../classes/AccessToken";
import {FullTwitchUser, TwitchChannel} from "../data/types";

const accessTokenUtil = new AccessToken();
const API_URL = 'https://api.twitch.tv/helix';

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

    static async getUserByLogin(login: string): Promise<FullTwitchUser | undefined> {
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
            const response = await axios.get(`${API_URL}/helix/users?login=${login}`, {
                headers: {
                    authorization: `Bearer ${accessTokenData.accessToken}`,
                    "client-id": process.env.CLIENT_ID,
                },
            });

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

    static async getUserById(userId: string): Promise<FullTwitchUser | undefined> {
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
            const response = await axios.get(`${API_URL}/users?id=${userId}`, {
                headers: {
                    authorization: `Bearer ${accessTokenData.accessToken}`,
                    "client-id": process.env.CLIENT_ID,
                },
            });

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

    static async getChannelById(broadcasterId: string): Promise<TwitchChannel | undefined> {
        const accessTokenData = await accessTokenUtil.get();

        if (accessTokenData) {
            try {
                const response = await axios.get<{ data: TwitchChannel[] }>(`${API_URL}/channels?broadcaster_id=${broadcasterId}`, {
                    headers: {
                        authorization: `Bearer ${accessTokenData.accessToken}`,
                        "client-id": process.env.CLIENT_ID,
                    },
                });

                return response.data.data[0];
            } catch (error) {
                console.log(error);
            }
        }
    }
}

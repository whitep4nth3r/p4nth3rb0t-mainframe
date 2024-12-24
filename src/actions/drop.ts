import * as Sentry from "@sentry/node";
import { config } from "../config";
import WebSocketServer from "../classes/WebSocketServer";
import UserManager from "../users/UserManager";
import {
  DropEmotePacket,
  DropUserPacket,
  MainframeEvent,
  WeatherPacket,
  WeatherTrailPacket,
  YeetUserPacket,
  ImageDropPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";

export const sendWeatherTrailEvent = async (trailing: boolean) => {
  try {
    const weatherTrailEvent: WeatherTrailPacket = {
      event: MainframeEvent.weatherTrailEvent,
      id: "trailing-" + Date.now(),
      data: {
        trailing: trailing,
      },
    };

    WebSocketServer.sendData(weatherTrailEvent);
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const sendDropUserEvent = async (userId: string, messageId: string) => {
  try {
    const user = await UserManager.getUserById(userId as string);

    if (user) {
      const dropUserEvent: DropUserPacket = {
        event: MainframeEvent.dropUser,
        id: messageId,
        data: {
          logoUrl: user.profile_image_url,
        },
      };

      WebSocketServer.sendData(dropUserEvent);
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const sendDropEmotesEvent = (
  emoteIds: [],
  bigEmotes: boolean,
  messageId: string,
  dropType: string,
) => {
  const imgSize = bigEmotes ? config.emotes.sizes[2] : config.emotes.sizes[1];
  try {
    const urls = emoteIds.map(
      (emoteId) => `${config.emotes.baseUrl}${emoteId}/${imgSize}`,
    );

    const emotesEvent: DropEmotePacket = {
      event: MainframeEvent.dropEmotes,
      id: messageId,
      data: {
        emoteUrls: urls,
        dropType: dropType,
      },
    };

    WebSocketServer.sendData(emotesEvent);
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const sendWeatherEvent = (weatherType: string, messageId: string) => {
  try {
    const weatherEvent: WeatherPacket = {
      event: MainframeEvent.weather,
      id: messageId,
      data: {
        weatherEvent: weatherType,
      },
    };

    WebSocketServer.sendData(weatherEvent);
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const sendYeetEvent = async (userName: string, messageId: string) => {
  try {
    const user = await UserManager.getUserByLogin(userName);

    if (user) {
      const yeetUserEvent: YeetUserPacket = {
        event: MainframeEvent.yeetUser,
        id: messageId,
        data: {
          logoUrl: user.profile_image_url,
        },
      };

      WebSocketServer.sendData(yeetUserEvent);
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};

export const sendImageDropEvent = async (type: string, messageId: string) => {
  try {
    const imageDropEvent: ImageDropPacket = {
      event: MainframeEvent.imageDrop,
      id: messageId,
      data: {
        type,
      },
    };

    WebSocketServer.sendData(imageDropEvent);
  } catch (error) {
    Sentry.captureException(error);
  }
};

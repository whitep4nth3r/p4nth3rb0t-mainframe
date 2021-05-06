import { config } from "../config";
import { UserByLoginResponse } from "../data/types";
import WebSocketServer from "../WebSocketServer";
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
    console.log(Error);
  }
};

export const sendDropUserEvent = async (userId: string, messageId: string) => {
  try {
    const user = await UserManager.getUserById(userId as string);

    const dropUserEvent: DropUserPacket = {
      event: MainframeEvent.dropUser,
      id: messageId,
      data: {
        logoUrl: user.logo as string,
      },
    };

    WebSocketServer.sendData(dropUserEvent);
  } catch (error) {
    console.log(error);
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
    console.log(error);
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
    console.log(error);
  }
};

export const sendYeetEvent = async (userName: string, messageId: string) => {
  try {
    const usersResponse: UserByLoginResponse = await UserManager.getUserByLogin(
      userName,
    );

    if (usersResponse.users[0].logo) {
      const yeetUserEvent: YeetUserPacket = {
        event: MainframeEvent.yeetUser,
        id: messageId,
        data: {
          logoUrl: usersResponse.users[0].logo,
        },
      };

      WebSocketServer.sendData(yeetUserEvent);
    }
  } catch (error) {
    console.log(error);
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
    console.log(error);
  }
};

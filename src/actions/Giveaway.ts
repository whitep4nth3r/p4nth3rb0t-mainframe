import { tmi } from "../tmi";
import { config } from "../config";
import { getCurrentChatters } from "../utils/twitchUtils";
import WebSocketServer from "../WebSocketServer";
import UserManager from "../users/UserManager";
import {
  AnnounceGiveawayPacket,
  DrawGiveawayPacket,
  EndGiveawayPacket,
  EnterGiveawayPacket,
  MainframeEvent,
  StartGiveawayPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";

const sendGiveawayAnnounceEvent = async () => {
  try {
    const giveawayAnnounceEvent: AnnounceGiveawayPacket = {
      event: MainframeEvent.announceGiveaway,
      id: `giveaway-announce${Math.random()}`,
      data: {},
    };

    WebSocketServer.sendData(giveawayAnnounceEvent);
  } catch (error) {
    console.log(error);
  }
};

const sendGiveawayStartEvent = async () => {
  try {
    const giveawayStartEvent: StartGiveawayPacket = {
      event: MainframeEvent.startGiveaway,
      id: `giveaway-start${Math.random()}`,
      data: {},
    };

    WebSocketServer.sendData(giveawayStartEvent);
  } catch (error) {
    console.log(error);
  }
};

const sendGiveawayEndEvent = async () => {
  try {
    const giveawayEndEvent: EndGiveawayPacket = {
      event: MainframeEvent.endGiveaway,
      id: `giveaway-end${Math.random()}`,
      data: {},
    };

    WebSocketServer.sendData(giveawayEndEvent);
  } catch (error) {
    console.log(error);
  }
};

const sendGiveawayEnterEvent = async (username: string) => {
  const user = await UserManager.getUserByLogin(username);

  if (user) {
    try {
      const enterGiveawayEvent: EnterGiveawayPacket = {
        event: MainframeEvent.enterGiveaway,
        id: `giveaway-enter${Math.random()}`,
        data: {
          username,
          logoUrl: user.profile_image_url.replace("300x300", "50x50"),
        },
      };

      WebSocketServer.sendData(enterGiveawayEvent);
    } catch (error) {
      console.log(error);
    }
  }
};

const sendGiveawayDrawEvent = async (winner: string) => {
  const user = await UserManager.getUserByLogin(winner);

  if (user) {
    try {
      const drawGiveawayEvent: DrawGiveawayPacket = {
        event: MainframeEvent.drawGiveaway,
        id: `giveaway${Math.random()}`,
        data: {
          winner,
          logoUrl: user.profile_image_url,
        },
      };

      WebSocketServer.sendData(drawGiveawayEvent);
      tmi.say(config.channel, Giveaway.getDrawMessage(winner));
    } catch (error) {
      console.log(error);
    }
  }
};

export default class Giveaway {
  static isOpen = false;
  static entrants: Set<string> = new Set();

  static commands = {
    announce: "!announcega",
    open: "!startga",
    close: "!endga",
    draw: "!drawga",
  };

  static getAnnounceMessage = (): string => {
    return "p4nth3rPEWPEW !win !win !win !win !win !win !win !win p4nth3rPEWPEW";
  };

  static getOpenMessage = (): string => {
    return "/announce p4nth3rPEWPEW The giveaway is open! Enter !win in chat to be in with a chance of winning! p4nth3rPEWPEW";
  };

  static getCloseMessage = (): string => {
    return "/announce p4nth3rPEWPEW The giveaway is closed! Thanks for playing! p4nth3rPEWPEW";
  };

  static getDrawMessage = (winner: string): string => {
    return `/announce p4nth3rPEWPEW Congratulations to @${winner}! p4nth3rPEWPEW Please whisper @Steffi128 to claim your prize!`;
  };

  static getInactiveMessage = (): string => {
    return "p4nth3rTROLL Access denied! There is no giveaway in progress! p4nth3rTROLL";
  };

  static getAlreadyOpenMessage = (): string => {
    return "p4nth3rTROLL @whitep4nth3r pressed the wrong button. Giveaway is already open! p4nth3rTROLL";
  };

  static announce = (): void => {
    sendGiveawayAnnounceEvent();
  };

  static open = (): void => {
    if (!Giveaway.isOpen) {
      Giveaway.entrants.clear();
      Giveaway.isOpen = true;
      sendGiveawayStartEvent();
    }
  };

  static close = (): void => {
    Giveaway.isOpen = false;
    Giveaway.entrants.clear();
    sendGiveawayEndEvent();
  };

  static inProgress = (): boolean => {
    return Giveaway.isOpen === true;
  };

  static enter = (username: string): void => {
    if (!Giveaway.entrants.has(username)) {
      sendGiveawayEnterEvent(username);
    }

    Giveaway.entrants.add(username);
  };

  static draw = async (): Promise<string | null> => {
    const usernamesArray: string[] = Array.from(Giveaway.entrants);
    const winner =
      usernamesArray[Math.floor(Math.random() * usernamesArray.length)];
    const currentChatters = await getCurrentChatters();

    if (winner !== null && winner !== undefined) {
      if (!currentChatters.includes(winner)) {
        // if winner is not in current chatters, go around again
        Giveaway.draw();
      } else {
        // return the winner if it is in current chatters
        sendGiveawayDrawEvent(winner);
        Giveaway.entrants.delete(winner);
        return winner;
      }
    }

    return null;
  };
}

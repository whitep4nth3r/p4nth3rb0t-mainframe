import * as Sentry from "@sentry/node";
import { announce, getCurrentChatterUserNames } from "../utils/twitchUtils";
import WebSocketServer from "../classes/WebSocketServer";
import UserManager from "../users/UserManager";
import {
  AnnounceGiveawayPacket,
  DrawGiveawayPacket,
  EndGiveawayPacket,
  EnterGiveawayPacket,
  MainframeEvent,
  StartGiveawayPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { TwitchAnnouncementColor } from "../data/types";
import { config } from "../config";
import { tmi } from "../tmi";

const sendGiveawayAnnounceEvent = async () => {
  try {
    const giveawayAnnounceEvent: AnnounceGiveawayPacket = {
      event: MainframeEvent.announceGiveaway,
      id: `giveaway-announce${Math.random()}`,
      data: {},
    };

    WebSocketServer.sendData(giveawayAnnounceEvent);
  } catch (error) {
    Sentry.captureException(error);
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
    Sentry.captureException(error);
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
    Sentry.captureException(error);
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
      Sentry.captureException(error);
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
      await announce(
        `p4nth3rPEWPEW Congratulations to @${winner}! p4nth3rPEWPEW Please whisper @Steffi128 to claim your prize!`,
        TwitchAnnouncementColor.Green,
      );
    } catch (error) {
      Sentry.captureException(error);
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
    const allEntrants: string[] = Array.from(Giveaway.entrants);
    const currentChatters = await getCurrentChatterUserNames();
    const presentEntrants: string[] = allEntrants.filter((e) =>
      currentChatters.includes(e),
    );
    if (presentEntrants.length === 0) {
      await tmi.say(
        config.channel,
        "p4nth3rTROLL None of the giveaway entrants are present in chat! p4nth3rTROLL"
      );

      return null;
    }
    const winner =
      presentEntrants[Math.floor(Math.random() * presentEntrants.length)];

    if (winner !== null && winner !== undefined) {
      // return the winner if it is in current chatters
      await sendGiveawayDrawEvent(winner);
      Giveaway.entrants.delete(winner);
      return winner;
    }

    return null;
  };
}

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

  try {
    const enterGiveawayEvent: EnterGiveawayPacket = {
      event: MainframeEvent.enterGiveaway,
      id: `giveaway-enter${Math.random()}`,
      data: {
        username,
        logoUrl: user.users[0].logo.replace("300x300", "50x50"),
      },
    };

    WebSocketServer.sendData(enterGiveawayEvent);
  } catch (error) {
    console.log(error);
  }
};

const sendGiveawayDrawEvent = async (winner: string) => {
  const user = await UserManager.getUserByLogin(winner);

  try {
    const drawGiveawayEvent: DrawGiveawayPacket = {
      event: MainframeEvent.drawGiveaway,
      id: `giveaway${Math.random()}`,
      data: {
        winner,
        logoUrl: user.users[0].logo,
      },
    };

    WebSocketServer.sendData(drawGiveawayEvent);
  } catch (error) {
    console.log(error);
  }
};

export default class Giveaway {
  static isOpen: boolean = false;
  static entrants: Set<string> = new Set();

  static commands = {
    announce: "!announcega",
    open: "!startga",
    close: "!endga",
    draw: "!drawga",
    entrants: "!getentrants",
  };

  static getAnnounceMessage = (): string => {
    return "whitep30PEWPEW !win !win !win !win !win !win !win !win whitep30PEWPEW";
  };

  static getOpenMessage = (): string => {
    return "whitep30PEWPEW The giveaway is open! Enter !win in chat to be in with a chance of winning! whitep30PEWPEW";
  };

  static getCloseMessage = (): string => {
    return "whitep30PEWPEW The giveaway is closed! Thanks for playing! whitep30PEWPEW";
  };

  static getNoEntrantsMessage = (): string => {
    return "whitep30TROLL The entry pot is empty! whitep30TROLL";
  };

  static getDrawMessage = (winner: string): string => {
    return `whitep30PEWPEW Congratulations to @${winner}! whitep30PEWPEW`;
  };

  static getInactiveMessage = (): string => {
    return "whitep30TROLL Access denied! There is no giveaway in progress! whitep30TROLL";
  };

  static getAlreadyOpenMessage = (): string => {
    return "whitep30TROLL @whitep4nth3r pressed the wrong button. Giveaway is already open! whitep30TROLL";
  };

  static getCurrentEntrantsMessage = (): string => {
    return `whitep30PEWPEW There are currently @${Giveaway.getTotalEntrants()} entrants in the draw!`;
  }

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

  static draw = (): string | null => {
    const usernamesArray: string[] = Array.from(Giveaway.entrants);
    const winner =
      usernamesArray[Math.floor(Math.random() * usernamesArray.length)];

    if (winner !== null && winner !== undefined) {
      sendGiveawayDrawEvent(winner);
      Giveaway.entrants.delete(winner);

      return winner;
    }    

    return null;
  };

  static getTotalEntrants = (): number => {
    return Giveaway.entrants.size;
  }
}

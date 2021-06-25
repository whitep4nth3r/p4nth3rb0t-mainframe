import { tmi } from "./../tmi";
import WebSocketServer from "../WebSocketServer";
import { ChatUserstate } from "tmi.js";
import { config } from "../config";
import {
  getCommandFromMessage,
  ChatCommands,
  BroadcasterCommands,
  ExclusiveCommands,
} from "../utils/commands";
import { isSillyQuestion } from "../utils/sillyQuestions";
import {
  TwitchChannel,
  TeamMembers,
  TeamMember,
  MyBadges,
} from "../data/types";
import UserManager from "../users/UserManager";
import Team from "../users/Team";
import Giveaway from "../actions/Giveaway";
import {
  ChatMessageData,
  ChatMessagePacket,
  DeletedChatMessagePacket,
  MainframeEvent,
  TeamMemberJoinPacket,
} from "@whitep4nth3r/p4nth3rb0t-types";

let possibleTeamMember: TeamMember | undefined;
const teamMembers: TeamMembers = Team.getUserNames();
const teamMembersGreeted: TeamMembers = [];

const sendDeletedMessageEvent = async (messageId: string) => {
  try {
    const deletedChatMessageEvent: DeletedChatMessagePacket = {
      event: MainframeEvent.deleteChatMessage,
      id: messageId,
      data: {
        messageId,
      },
    };

    WebSocketServer.sendData(deletedChatMessageEvent);
  } catch (error) {
    console.log(error);
  }
};

const sendChatMessageEvent = async (data: ChatMessageData) => {
  try {
    const chatMessageEvent: ChatMessagePacket = {
      event: MainframeEvent.chatMessage,
      id: data.messageId,
      data,
    };

    WebSocketServer.sendData(chatMessageEvent);
  } catch (error) {
    console.log(error);
  }
};

const sendteamMemberJoinEvent = async (teamMember: TeamMember) => {
  try {
    const user = await UserManager.getUserById(teamMember.id as string);

    const teamMemberJoin: TeamMemberJoinPacket = {
      event: MainframeEvent.teamMemberJoin,
      id: teamMember.name + "-" + Date.now(),
      data: {
        logoUrl: user.logo,
      },
    };

    WebSocketServer.sendData(teamMemberJoin);
  } catch (error) {
    console.log(error);
  }
};

tmi.on(
  "messagedeleted",
  async (
    channel: string,
    username: string,
    deletedMessage: string,
    tags: ChatUserstate,
  ) => {
    sendDeletedMessageEvent(tags["target-msg-id"]);
  },
);

tmi.on(
  "chat",
  async (
    channel: string,
    tags: ChatUserstate,
    message: string,
    self: boolean,
  ) => {
    if (config.ignoredUsers.includes(tags.username as string)) {
      return;
    }

    if (config.ignoredMessages.includes(message)) {
      return;
    }

    const messageContainsIgnoredWords = config.ignoredWords.some((word) =>
      message.includes(word),
    );

    const messageContainsIgnoredChars = config.ignoredCharacters.some((char) =>
      message.includes(char),
    );

    if (messageContainsIgnoredWords || messageContainsIgnoredChars) {
      return;
    }

    /**
     * Mods can also change the mood on the overlay
     */
    if (tags["user-type"] === "mod") {
      const possibleBroadcasterCommand: string =
        getCommandFromMessage(message).toLowerCase();
      const foundHandler = BroadcasterCommands[possibleBroadcasterCommand];

      if (typeof foundHandler === "function") {
        foundHandler(tags, message);
      }
    }

    if (tags.username === config.broadcaster.name) {
      /* Super special limited edition commands for broadcaster only */
      const possibleExclusiveCommand: string =
        getCommandFromMessage(message).toLowerCase();
      const foundExclusiveCommand = ExclusiveCommands[possibleExclusiveCommand];

      if (typeof foundExclusiveCommand === "function") {
        foundExclusiveCommand(tags, message);
      }

      const possibleBroadcasterCommand: string =
        getCommandFromMessage(message).toLowerCase();
      const foundHandler = BroadcasterCommands[possibleBroadcasterCommand];

      if (typeof foundHandler === "function") {
        foundHandler(tags, message);
      }

      if (message === "!reset") {
        teamMembersGreeted.splice(0, teamMembersGreeted.length);
        tmi.say(
          config.channel,
          `${config.teamName} greetings cache has been reset. Current length of cache is ${teamMembersGreeted.length}.`,
        );
      }

      if (message === Giveaway.commands.announce) {
        Giveaway.announce();

        tmi.say(config.channel, Giveaway.getAnnounceMessage());
      }

      if (message === Giveaway.commands.open) {
        if (Giveaway.isOpen) {
          tmi.say(config.channel, Giveaway.getAlreadyOpenMessage());
        } else {
          Giveaway.open();
          tmi.say(config.channel, Giveaway.getOpenMessage());
        }
      }

      if (message === Giveaway.commands.close) {
        Giveaway.close();

        tmi.say(config.channel, Giveaway.getCloseMessage());
      }

      if (message === Giveaway.commands.draw) {
        const winner = Giveaway.draw();

        if (winner !== null) {
          tmi.say(config.channel, Giveaway.getDrawMessage(winner));
        } else {
          tmi.say(config.channel, Giveaway.getNoEntrantsMessage());
        }
      }

      if (message === Giveaway.commands.entrants) {
        if(Giveaway.isOpen) {
          if(Giveaway.entrants.size <= 0)
          {
            tmi.say(config.channel, Giveaway.getNoEntrantsMessage())
          }
          else {
            tmi.say(config.channel, Giveaway.getCurrentEntrantsMessage())
          }          
        } else {
          tmi.say(config.channel, Giveaway.getInactiveMessage());
        }
      }
    }

    if (config.teamShoutoutEnabled && process.env.NODE_ENV === "production") {
      possibleTeamMember = teamMembers.find(
        (member) => member.name === tags.username,
      );

      if (
        possibleTeamMember &&
        !teamMembersGreeted.includes(possibleTeamMember) &&
        possibleTeamMember.name !== config.broadcaster.name
      ) {
        const teamMemberChannel = await Team.getChannelById(
          possibleTeamMember.id,
        );

        tmi.say(
          config.channel,
          Team.getWelcomeMessage(teamMemberChannel as TwitchChannel),
        );
        teamMembersGreeted.push(possibleTeamMember);
        sendteamMemberJoinEvent(possibleTeamMember);
      }
    }

    if (isSillyQuestion(message)) {
      tmi.say(config.channel, config.botResponses.SillyQuestion(tags.username));
    }

    const possibleCommand: string =
      getCommandFromMessage(message).toLowerCase();
    const foundHandler = ChatCommands[possibleCommand];

    if (typeof foundHandler === "function") {
      foundHandler(tags, message);
    } else if (!message.startsWith("!")) {
      //if no 'command', send a chat message
      const badges: MyBadges = tags.badges || {};
      const isMod: boolean = tags.mod || false;
      const isSubscriber: boolean =
        tags.subscriber || badges.founder !== undefined || false;
      const isVip: boolean = badges.vip ? badges.vip === "1" : false;

      const isBroadcaster: boolean = badges.broadcaster
        ? badges.broadcaster === "1"
        : false;

      const user = await UserManager.getUserById(tags["user-id"] as string);

      const isMyFavoriteStreamer = user._id === "279965339"; // BBB ;)

      const chatMessageData: ChatMessageData = {
        userId: tags["user-id"] as string,
        username: tags.username as string,
        displayName: tags["display-name"] as string,
        messageId: tags.id as string,
        message: message as string,
        logoUrl: user.logo,
        teamMemberIconUrl: user.logo,
        isMod,
        isVip,
        isSubscriber,
        isBroadcaster,
        isMyFavoriteStreamer,
        isTeamMember: config.teamShoutoutEnabled
          ? possibleTeamMember !== undefined || isBroadcaster
          : false,
        emotes: tags.emotes,
        type: tags["message-type"],
        id: tags["id"],
      };

      await sendChatMessageEvent(chatMessageData);
    }
  },
);

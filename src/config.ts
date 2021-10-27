import { DiscordReactionRole, TwitchChannel, TwitchUser } from "./data/types";

interface Config {
  FREEZE_MODE: boolean;
  broadcaster: TwitchUser;
  channel: string;
  drop: {
    minAccountAge: number;
  };
  emotes: {
    baseUrl: string;
    sizes: string[];
  };
  specialUsers: string[];
  ignoredUsers: string[];
  ignoredCharacters: string[];
  ignoredWords: string[];
  ignoredMessages: string[];
  botResponses: any;
  teamShoutoutEnabled: boolean;
  team: {
    name: string;
    displayName: string;
  };
  teamWelcomeMessage: (channel: TwitchChannel) => string;
  discord: {
    liveAnnouncementsChannelId: string;
    liveAnnouncementsRoleId: string;
    liveAnnouncementColorOnline: string;
    liveAnnouncementColorOffline: string;
    liveAnnouncementImageSize: string;
    reactionRole: DiscordReactionRole[];
  };
  moodRedemptions: {
    [key: string]: string;
  };
  channelRedemptions: {
    [key: string]: string;
  };
}

const config: Config = {
  FREEZE_MODE: false,
  broadcaster: {
    user_login: "DenverTheCoder",
    user_name: "DenverTheCoder",
    user_id: "64115778",
  },
  channel: "#denverthecoder",
  drop: {
    minAccountAge: 7 * 24 * 60 * 60 * 1000,
  },
  emotes: {
    baseUrl: "https://static-cdn.jtvnw.net/emoticons/v1/",
    sizes: ["1.0", "2.0", "3.0"],
  },
  specialUsers: [
    
  ],
  ignoredUsers: ["nightbot", "pretzelrocks", "p4nth3rb0t"],
  ignoredCharacters: ["a̞", "s̾", "ȯ", "a̹", "u͖"],
  ignoredWords: ["bigfollows"],
  ignoredMessages: [
    "Twitch Themer is ready to go. Listening for commands beginning with !theme",
    "Twitch Highlighter in the house!",
  ],
  botResponses: {
    SillyQuestion: (username: string) => {
      return `Hi there ${username}! You can use the following commands in chat to find out more: !project, !today, !who`;
    },
  },
  teamShoutoutEnabled: true,
  team: {
    name: "theclaw",
    displayName: "The Claw",
  },
  teamWelcomeMessage: (channel: TwitchChannel): string => {
    return `Hello friend @${channel.broadcaster_name}!`;
  },
  discord: {
    liveAnnouncementsChannelId: "827523976283815947",
    liveAnnouncementsRoleId: "903008079363330049",
    liveAnnouncementColorOnline: "#84AE39",
    liveAnnouncementColorOffline: "#AE8439",
    liveAnnouncementImageSize: "1280x720",
    reactionRole: [
      {
        role_id: "756956508234842145",
        emoji_tag: "📣",
        message_id: "841608870001508372",
      },
    ],
  },
  moodRedemptions: {
  },
  channelRedemptions: {
  },
};

export { config };

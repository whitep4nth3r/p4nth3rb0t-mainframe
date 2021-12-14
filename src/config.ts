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
  botResponses: Record<string, unknown>;
  teamShoutoutEnabled: boolean;
  team: {
    name: string;
    displayName: string;
  };
  teamWelcomeMessage: (channel: TwitchChannel) => string;
  discord: {
    linesBeforeGisting: number,
    whitep4nth3rId: string,
    p4nth3rb0tId: string,
    techHelpChannelId: string;
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
    user_login: "whitep4nth3r",
    user_name: "whitep4nth3r",
    user_id: "469006291",
  },
  channel: "#whitep4nth3r",
  drop: {
    minAccountAge: 7 * 24 * 60 * 60 * 1000,
  },
  emotes: {
    baseUrl: "https://static-cdn.jtvnw.net/emoticons/v1/",
    sizes: ["1.0", "2.0", "3.0"],
  },
  specialUsers: [
    "thatn00b__",
    "baldbeardedbuilder",
    "lucecarter",
    "sociablesteve",
    "rawwwrs",
    "toefrog",
    "dr_dinomight",
    "matty_twoshoes",
    "imolalola",
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
    return `p4nth3rPEWPEW ${config.team.displayName} team member detected!
    PEW PEW, @${channel.broadcaster_name}!
    Check out their channel here: https://twitch.tv/${channel.broadcaster_name}
    | They were last seen streaming ${channel.title} in ${channel.game_name} p4nth3rPEWPEW`;
  },
  discord: {
    linesBeforeGisting: 15,
    whitep4nth3rId: "722393276438544404",
    p4nth3rb0tId: "769179005315973171",
    techHelpChannelId: "748594864404561990",
    liveAnnouncementsChannelId: "770041334534635520",
    liveAnnouncementsRoleId: "756956508234842145",
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
    "40496421-bf68-4854-a417-cf03390062f2": "coffee",
    "2a8f5598-0d54-47c7-a1cb-c2f2068f13f5": "cool",
    "214baddc-bf47-483c-8297-2089484e55db": "dolla",
    "1e20afa0-a66d-44cf-b052-494150085b41": "fire",
    "e7be41df-4942-47ef-bfd6-945004b9515d": "heart",
    "810293fe-2996-468d-86be-8fd5f3ede35a": "hype",
    "3a1bbb8a-3b46-4f4f-b462-d4fe2d69fc7f": "majick",
    "c496ca07-506f-426a-ac3a-c18f9e313819": "pewpew",
    "0e9ac3dc-36fa-44a2-811a-21c062ab15cb": "rap",
    "22f97669-4655-4524-83e2-1ae7ddf7401b": "sad",
    "dd1bd410-ce90-4669-a9a7-59adf4fc226a": "star",
    "f8494e84-1089-48c1-a411-1d1a33ac38be": "tattoo",
    "899073ec-e720-4431-ba6b-5953f1bd246e": "troll",
  },
  channelRedemptions: {
    "a5ac6965-dd33-4d09-8787-a177debc6e14": "numeronym",
  },
};

export { config };

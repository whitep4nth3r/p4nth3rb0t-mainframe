import {tmi} from "../tmi";
import WebSocketServer from "../WebSocketServer";
import {ChatUserstate} from "tmi.js";
import {config} from "../config";
import {
    getCommandFromMessage,
    ChatCommands,
    BroadcasterCommands,
    ExclusiveCommands,
} from "../utils/commands";
import {
    MyBadges,
} from "../data/types";
import UserManager from "../users/UserManager";
import {
    TimeoutUserPacket,
    BanUserPacket,
    ChatMessageData,
    ChatMessagePacket,
    DeletedChatMessagePacket,
    MainframeEvent,
} from "@whitep4nth3r/p4nth3rb0t-types";

const sendTimeoutUserEvent = async (userId: string) => {
    try {
        const timeoutUserEvent: TimeoutUserPacket = {
            event: MainframeEvent.timeoutUser,
            id: userId,
            data: {
                userId,
            },
        };

        WebSocketServer.sendData(timeoutUserEvent);
    } catch (error) {
        console.log(error);
    }
};

const sendBanUserEvent = async (userId: string) => {
    try {
        const bannedUserEvent: BanUserPacket = {
            event: MainframeEvent.banUser,
            id: userId,
            data: {
                userId,
            },
        };

        WebSocketServer.sendData(bannedUserEvent);
    } catch (error) {
        console.log(error);
    }
};

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

tmi.on("messagedeleted", async (channel: string, username: string, deletedMessage: string, tags: ChatUserstate) => {
    await sendDeletedMessageEvent(tags["target-msg-id"]);
});

tmi.on("ban", (channel: string, username: string, reason: null, tags: ChatUserstate) => {
    sendBanUserEvent(tags["target-user-id"]).then(() => {
        return true;
    });
});

tmi.on("timeout", (channel: string, username: string, reason: null, duration: number, tags: ChatUserstate) => {
    sendTimeoutUserEvent(tags["target-user-id"]).then(() => {
        return true;
    });
});

tmi.on("chat", async (channel: string, tags: ChatUserstate, message: string, self: boolean) => {
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
     * Allow !freeze and !unfreeze regardless
     */
    if (tags["user-type"] === "mod") {
        const possibleBroadcasterCommand: string =
            getCommandFromMessage(message).toLowerCase();
        const foundHandler = BroadcasterCommands[possibleBroadcasterCommand];

        if (typeof foundHandler === "function") {
            foundHandler(tags, message);
        }
    }

    if (tags.username === config.broadcaster.user_name) {
        /* Super special limited edition commands for broadcaster only */
        const possibleExclusiveCommand: string = getCommandFromMessage(message).toLowerCase();
        const foundExclusiveCommand = ExclusiveCommands[possibleExclusiveCommand];

        if (typeof foundExclusiveCommand === "function") {
            foundExclusiveCommand(tags, message);
        }

        const possibleBroadcasterCommand: string = getCommandFromMessage(message).toLowerCase();
        const foundHandler = BroadcasterCommands[possibleBroadcasterCommand];

        if (typeof foundHandler === "function") {
            foundHandler(tags, message);
        }

        if (!config.FREEZE_MODE) {
            const possibleCommand: string = getCommandFromMessage(message).toLowerCase();
            const foundHandler = ChatCommands[possibleCommand];

            if (typeof foundHandler === "function") {
                foundHandler(tags, message);
            } else if (!message.startsWith("!")) {
                const badges: MyBadges = tags.badges || {};
                const isPartner: boolean = badges.partner !== undefined;
                const isMod: boolean = tags.mod || false;

                const isSubscriber: boolean = tags.subscriber || badges.founder !== undefined || false;
                const isVip: boolean = badges.vip ? badges.vip === "1" : false;

                const isBroadcaster: boolean = badges.broadcaster ? badges.broadcaster === "1" : false;

                const user = await UserManager.getUserById(tags["user-id"] as string);

                if (user) {
                    const chatMessageData: ChatMessageData = {
                        userId: tags["user-id"] as string,
                        username: tags.username as string,
                        displayName: tags["display-name"] as string,
                        messageId: tags.id as string,
                        message: message as string,
                        logoUrl: user.profile_image_url,
                        teamMemberIconUrl: user.profile_image_url,
                        isMod,
                        isVip,
                        isSubscriber,
                        isBroadcaster,
                        isPartner,
                        isTeamMember: false,
                        emotes: tags.emotes,
                        type: tags["message-type"],
                        id: tags["id"],
                    };

                    await sendChatMessageEvent(chatMessageData);
                }
            }
        }
    }
});

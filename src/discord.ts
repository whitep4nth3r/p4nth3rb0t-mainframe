import UserManager from "./users/UserManager";
import DiscordAnnouncementModel from "./data/models/DiscordAnnouncement";
import Discord, { Message, MessageEmbed, MessageReaction, User } from "discord.js";
import { config } from "./config";
import {
    fetchVideoByUserId,
    getActiveBroadcasterStreamByBroadcasterId,
} from "./utils/twitchUtils";
import type { PartialUser, TextChannel } from "discord.js";
import type { DiscordReactionRole, StreamInfo } from "./data/types";
import crypto from "crypto";
import axios from "axios";

export const discord = new Discord.Client({
    partials: ["USER", "REACTION", "MESSAGE"],
});

let announcementsChannel: TextChannel;
let techHelpChannel: TextChannel;

discord.on("ready", async () => {
    console.log(`🤖 Logged in to Discord as ${discord.user?.username}!`);

    announcementsChannel = (await discord.channels.fetch(
        config.discord.liveAnnouncementsChannelId,
    )) as TextChannel;

    techHelpChannel = (await discord.channels.fetch(
        config.discord.techHelpChannelId,
    )) as TextChannel;
});

discord.on(
    "messageReactionAdd",
    async (messageReaction: MessageReaction, user: User | PartialUser) => {
        if ( user.bot ) {
            return;
        }

        if ( messageReaction.partial ) {
            await messageReaction.fetch();
        }

        const { guild } = messageReaction.message;

        if ( !guild ) {
            return;
        }

        const reactionRole: DiscordReactionRole | undefined =
            config.discord.reactionRole.find(
                (role) =>
                    role.emoji_tag == messageReaction.emoji.toString() &&
                    role.message_id == messageReaction.message.id,
            );

        if ( !reactionRole ) {
            return;
        }

        guild.member(user.id)?.roles.add(reactionRole.role_id);
    },
);

discord.on(
    "messageReactionRemove",
    async (messageReaction: MessageReaction, user: User | PartialUser) => {
        if ( user.bot ) {
            return;
        }

        if ( messageReaction.partial ) {
            await messageReaction.fetch();
        }

        const { guild } = messageReaction.message;

        if ( !guild ) {
            return;
        }

        const reactionRole: DiscordReactionRole | undefined =
            config.discord.reactionRole.find(
                (role) =>
                    role.emoji_tag == messageReaction.emoji.toString() &&
                    role.message_id == messageReaction.message.id,
            );

        if ( !reactionRole ) {
            return;
        }

        guild.member(user.id)?.roles.remove(reactionRole.role_id);
    },
);

discord.on("message", async (message: Message) => {
    let uniqueUser = `${message.author.username}#${message.author.discriminator}`;
    // Read message to see if it contains 3 backticks indicating a code block.
    if ( message.channel.id === config.discord.techHelpChannelId && message.content.includes("```") ) {
        // Okay, we have a message. Lets split it into an array every time the line ends.
        let msg = message.content;
        let lines = msg.split("\n");

        // Generate a file name.
        let fileName = [];

        let hash = crypto.createHash("shake256", { outputLength: 9 })
            .update(message.content).digest('hex');

        fileName.push(`${uniqueUser}-${hash}`, '.')
        for ( let i = 0; i < lines.length; i++ ) {
            if ( lines[i].startsWith("```") ) {
                let d = lines[i].split("```");
                if ( d.length > 0 ) {
                    fileName.push(d.join(""));
                }
            }
        }

        let fullFileName = fileName.join("");

        // Extract the rest of the message excluding the code block.
        let messages: string[] = [];
        let insideCodeBlock: boolean = false;
        let codeBlock: string[] = [];
        let lineCount: number = 0;
        for ( let j = 0; j < lines.length; j++ ) {
            if ( lines[j].includes("```") && insideCodeBlock ) {
                insideCodeBlock = false;
            } else if ( lines[j].includes("```") && !insideCodeBlock ) {
                insideCodeBlock = true;
            } else {
                if ( !insideCodeBlock ) {
                    messages.push(`> ${lines[j]}\n`);
                } else {
                    lineCount++;
                    codeBlock.push(`${lines[j]}\n`);
                }
            }
        }

        if ( lineCount > 3 ) {
            axios.post("https://api.github.com/gists", {
                description: `A gist by ${uniqueUser} from #tech-help on The Claw.`,
                files: {
                    [fullFileName]: {
                        content: codeBlock.join("")
                    }
                }
            }, {
                headers: {
                    "Authorization": `token ${process.env.GITHUB_ACCESS_TOKEN}`,
                    "Accept": "application/vnd.github.v3+json",
                }
            }).then(response => {
                let new_message = [
                    `Original message from <@${message.author.id}>:\n`,
                    messages.join(""),
                    `Code in available in this gist:`,
                    `<${response.data.html_url}>`
                ];
                console.log("got the gist!", new_message);

                techHelpChannel.send({
                    content: new_message
                }).then(() => {
                    message.delete({ reason: "Replaced with gisted code." })
                });

            }).catch(e => {
                console.error(e);
            });
        }
    }
})

export const sendLiveAnnouncement = async (streamInfo: StreamInfo) => {
    if ( announcementsChannel ) {
        const user = await UserManager.getUserById(streamInfo.broadcaster_user_id);

        if ( user ) {
            const started_at = new Date(streamInfo.started_at);
            const stream = await getActiveBroadcasterStreamByBroadcasterId(
                streamInfo.broadcaster_user_id,
            );

            const videoTitle = stream !== null ? stream.title : "";
            const videoThumbnailUrl = stream !== null ? stream.thumbnail_url : "";
            const category = stream !== null ? stream.game_name : "";

            const embed = buildDiscordEmbed(
                true,
                user.login,
                user.display_name,
                user.profile_image_url,
                videoTitle,
                videoThumbnailUrl,
                `Started streaming • Today at ${started_at.toTimeString()}`,
                category,
            );

            const onlineAnnouncementPrefix: string =
                process.env.NODE_ENV === "production"
                    ? `<@&${config.discord.liveAnnouncementsRoleId}> `
                    : "";

            const existing = await DiscordAnnouncementModel.findOne({
                streamId: streamInfo.id,
            });
            let message;
            if ( existing ) {
                message = await announcementsChannel.messages.fetch(
                    `${existing.messageId}`,
                );
                await message.edit({
                    content: `${onlineAnnouncementPrefix}${Discord.Util.escapeMarkdown(
                        user.display_name,
                    )} is now live on Twitch! https://twitch.tv/${user.login}`,
                    embed,
                });
            } else {
                message = await announcementsChannel.send({
                    content: `${onlineAnnouncementPrefix}${Discord.Util.escapeMarkdown(
                        user.display_name,
                    )} is now live on Twitch! https://twitch.tv/${user.login}`,
                    embed,
                });
            }

            await DiscordAnnouncementModel.updateOne(
                { memberId: streamInfo.broadcaster_user_id },
                {
                    memberId: streamInfo.broadcaster_user_id,
                    messageId: message.id,
                    streamId: streamInfo.id,
                    category: category,
                },
                { upsert: true },
            );
        }
    }
};

export const sendOfflineAnnouncement = async (member_id: string) => {
    const video = await fetchVideoByUserId(member_id);

    if ( !video ) {
        return;
    }

    const saved_message = await DiscordAnnouncementModel.findOne({
        memberId: member_id,
    });

    if ( !saved_message ) {
        return;
    }

    const message = await announcementsChannel.messages.fetch(
        `${saved_message.messageId}`,
    );

    const user = await UserManager.getUserById(member_id);

    if ( user ) {
        const embed = buildDiscordEmbed(
            false,
            user.login,
            user.display_name,
            user.profile_image_url,
            video.title,
            video.thumbnail_url,
            `Finished streaming • Streamed for ${video.duration}`,
            saved_message.category,
            video.id,
        );

        await message.edit({
            content: `${user.display_name} was online!`,
            embed,
        });

        await DiscordAnnouncementModel.deleteOne({ memberId: member_id });
    }
};

const buildDiscordEmbed = (
    online: boolean,
    userName: string,
    userDisplayName: string,
    userLogo: string,
    streamTitle: string,
    imageUrl: string,
    footer: string,
    category: string,
    videoId?: string,
) => {
    const embed = new MessageEmbed();

    embed.setAuthor(userDisplayName, userLogo);
    embed.setTitle(streamTitle);
    embed.setThumbnail(userLogo);

    embed.setURL(
        online
            ? `https://twitch.tv/${userName}`
            : `https://twitch.tv/videos/${videoId}`,
    );

    const imageReplaceString = online ? "{width}x{height}" : "%{width}x%{height}";

    embed.setImage(
        imageUrl.replace(
            imageReplaceString,
            config.discord.liveAnnouncementImageSize,
        ),
    );

    embed.setColor(
        online
            ? config.discord.liveAnnouncementColorOnline
            : config.discord.liveAnnouncementColorOffline,
    );

    embed.setFooter(footer);

    if ( category.length ) {
        embed.setDescription(category);
    }

    return embed;
};

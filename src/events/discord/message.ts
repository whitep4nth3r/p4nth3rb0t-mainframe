import { Message, TextChannel } from "discord.js";
import { config } from "../../config";
import crypto from "crypto";
import axios from "axios";
import { discord } from "../../discord";

let techHelpChannel: TextChannel;

discord.on("ready", async () => {
  techHelpChannel = (await discord.channels.fetch(
    config.discord.techHelpChannelId,
  )) as TextChannel;
});

discord.on("message", async (message: Message) => {
  if(message.content.includes(`<@!${config.discord.whitep4nth3rId}>`)) {
    if(message.author.id !== config.discord.p4nth3rb0tId) {
      message.channel.send(
        `Attention <@!${message.author.id}>! Please refrain from mentioning ` +
        `whitep4nth3r directly if it is not extremely urgent. Thank you.`
      ).then(() => {
        return null;
      });
    }
  }

  const uniqueUser = `${message.author.username}#${message.author.discriminator}`;
  // Read message to see if it contains 3 backticks indicating a code block.
  if (message.channel.id === config.discord.techHelpChannelId && message.content.includes("```")) {
    // Okay, we have a message. Lets split it into an array every time the line ends.
    const msg = message.content;
    const lines = msg.split("\n");

    // Generate a file name.
    const fileName = [];

    const hash = crypto.createHash("shake256", { outputLength: 9 })
      .update(message.content).digest("hex");

    fileName.push(`${uniqueUser}-${hash}`, ".");
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("```")) {
        const d = lines[i].split("```");
        if (d.length > 0) {
          fileName.push(d.join(""));
        }
      }
    }

    const fullFileName = fileName.join("");

    let insideCodeBlock = false;
    const codeBlock: string[] = [];
    let lineCount = 0;
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].includes("```") && insideCodeBlock) {
        insideCodeBlock = false;
      } else if (lines[j].includes("```") && !insideCodeBlock) {
        insideCodeBlock = true;
      } else {
        if (insideCodeBlock) {
          lineCount++;
          codeBlock.push(`${lines[j]}\n`);
        }
      }
    }

    if (lineCount > 3) {
      axios.post("https://api.github.com/gists", {
        description: `A gist by ${uniqueUser} from #tech-help on The Claw.`,
        files: {
          [fullFileName]: {
            content: codeBlock.join(""),
          },
        },
      }, {
        headers: {
          "Authorization": `token ${process.env.GITHUB_ACCESS_TOKEN}`,
          "Accept": "application/vnd.github.v3+json",
        },
      }).then(response => {
        const new_message = [
          `Thanks <@${message.author.id}>! I've created a Gist on GitHub for you.\n`,
          `Code is available in this gist:`,
          `<${response.data.html_url}>`,
        ];

        techHelpChannel.send({
          content: new_message,
        });

      }).catch(e => {
        console.error(e);
      });
    }
  }
});
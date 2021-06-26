import WebSocket from "ws";
import { sendOfflineAnnouncement, sendLiveAnnouncement, sendTwitchOfflineAnnouncement } from "./discord";
import { GlimeshStreamInfoProvider } from "./data/types";
import { config } from "./config";

export default class GlimeshClient {
  static ws: WebSocket;

  static create() {
    this.ws = new WebSocket(
      `wss://glimesh.tv/api/socket/websocket?vsn=2.0.0&client_id=${process.env.GLIMESH_CLIENT_ID}`,
    );
    this.ws.on("open", () => {
      this.ws.send(
        JSON.stringify(["1", "1", "__absinthe__:control", "phx_join", {}]),
      );
      config.glimeshChannels.forEach((channelId) => {
        this.ws.send(this._subscribeMessageForChannelId(channelId));
      });
      const ping = setInterval(() => {
        this.ws.send(JSON.stringify(["1", "1", "phoenix", "heartbeat", {}]));
      }, 20000);

      this.ws.on("close", (_cc: number, _cmsg: string) => {
        clearInterval(ping);
      });
    });
    this.ws.on("message", async (data) => {
      const parsedData: (any | null)[] = JSON.parse(data.toString());
      if (parsedData[3] === 'subscription:data') {
        const channelData = parsedData[4].result.data.channel;
        if (channelData.status === 'LIVE') {
          await sendLiveAnnouncement(new GlimeshStreamInfoProvider(channelData));
        } else if (channelData.status === 'OFFLINE') {
          const streamInfo = await new GlimeshStreamInfoProvider(channelData).resolve();
          await sendOfflineAnnouncement(streamInfo);
        }
      }
    });
  }

  static _subscribeMessageForChannelId(id: number) {
    return JSON.stringify([
      "1",
      "1",
      "__absinthe__:control",
      "doc",
      {
        query:
          `subscription { channel(id: ${id}) { 
            title, 
            id,
            status,
            language,
            category {
              name
            }
            streamer {
              displayname,
              username,
              avatarUrl
            }
            stream {
              category {
                name
              }
              subcategory {
                name
              }
              title,
              thumbnail,
              startedAt,
              avgViewers
            }
          }
        }`,
        variables: {},
      },
    ]);
  }
}

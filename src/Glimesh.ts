import WebSocket from "ws";
import { sendLiveAnnouncement, sendTwitchLiveAnnouncement } from "./discord";
import { GlimeshStreamInfoProvider } from "./data/types";

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
      this.ws.send(
        JSON.stringify([
          "1",
          "1",
          "__absinthe__:control",
          "doc",
          {
            query:
              `subscription { channel(id: 15497) { 
                title, 
                id,
                status,
                language,
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
        ]),
      );
      const ping = setInterval(() => {
        this.ws.send(JSON.stringify(["1", "1", "phoenix", "heartbeat", {}]));
      }, 20000);

      this.ws.on("close", (_cc: number, _cmsg: string) => {
        clearInterval(ping);
      });
    });
    this.ws.on("message", async (data) => {
      console.log(data);
      const parsedData: (any | null)[] = JSON.parse(data.toString());
      if (parsedData[3] === 'subscription:data') {
        const channelData = parsedData[4].result.data.channel;
        if (channelData.status === 'LIVE') {
          await sendLiveAnnouncement(new GlimeshStreamInfoProvider(channelData));
        }
      }
    });
  }
}

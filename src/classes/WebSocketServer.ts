import { Packet } from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocket from "ws";
import { webServer } from "../webserver";
import { ExtWebSocket } from "../data/types";

export default class WebsocketServer {
  static wsServer: WebSocket.Server;

  static create(): void {
    this.wsServer = new WebSocket.Server({ server: webServer });

    this.wsServer.on("connection", (ws: ExtWebSocket) => {
      ws.isAlive = true;

      ws.on("pong", () => {
        ws.isAlive = true;
      });

      const ping = setInterval(() => {
        this.wsServer.clients.forEach((ws: any) => {
          if (!ws.isAlive) {
            return ws.terminate();
          }

          ws.isAlive = false;

          ws.ping(() => {
            return true;
          });
        });
      }, 10000);

      ws.on("close", function (cc: number, cmsg: string) {
        clearInterval(ping);
      });

      ws.send(
        JSON.stringify({
          status: 200,
          msg: "🔥 Welcome to the p4nth3rb0t mainframe",
        }),
      );
    });
  }

  static get() {
    return this.wsServer;
  }

  static sendData(data: Packet): void {
    this.wsServer.clients.forEach((client) => {
      client.send(JSON.stringify(data));
    });
  }
}

import { BackseatPacket, MainframeEvent } from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";
import UserManager from "../users/UserManager";
import { getCurrentChatters } from "../utils/twitchUtils";

export const sendClearBackSeatEvent = async () => {
  try {
    const backseatEvent: BackseatPacket = {
      event: MainframeEvent.backseat,
      id: "backseat-clear",
      data: {
        imageUrl: "",
      },
    };

    WebSocketServer.sendData(backseatEvent);
  } catch (error) {
    console.log(error);
  }
};

export const sendBackseatEvent = async (username: string) => {
  const currentChatters = await getCurrentChatters();

  if (currentChatters.includes(username)) {
    try {
      const user = await UserManager.getUserByLogin(username);

      if (user) {
        const backseatEvent: BackseatPacket = {
          event: MainframeEvent.backseat,
          id: `backseat-${username}`,
          data: {
            imageUrl: user.users[0].logo,
          },
        };

        WebSocketServer.sendData(backseatEvent);
      }
    } catch (error) {
      console.log(error);
    }
  }
};

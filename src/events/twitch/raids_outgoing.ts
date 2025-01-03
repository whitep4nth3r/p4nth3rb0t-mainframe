import * as Sentry from "@sentry/node";
import { getRestOfMessage } from "../../utils/commands";
import UserManager from "../../users/UserManager";
import {
  MainframeEvent,
  OutgoingRaidPacket,
  OutgoingRaidData,
} from "@whitep4nth3r/p4nth3rb0t-types";
import { startRaid } from "../../utils/twitchUtils";
import WebSocketServer from "../../classes/WebSocketServer";

export const sendRaidEvent = async (
  messageId: string,
  message: string,
): Promise<void> => {
  const possibleUsername: string[] = getRestOfMessage(message);

  try {
    const user = await UserManager.getUserByLogin(possibleUsername[0]);

    if (user) {
      const new_raid = await startRaid(user.id);

      if (new_raid.status === 200) {
        const dataToSend: OutgoingRaidData = {
          logoUrl: user.profile_image_url,
          username: user.display_name,
        };

        const outgoingRaidEvent: OutgoingRaidPacket = {
          event: MainframeEvent.outgoingraid,
          id: messageId,
          data: dataToSend,
        };

        WebSocketServer.sendData(outgoingRaidEvent);
      }
    }
  } catch (error) {
    Sentry.captureException(error);
  }
};

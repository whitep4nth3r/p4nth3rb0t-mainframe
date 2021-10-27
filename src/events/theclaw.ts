import { TwitchUser } from "./../data/types";
import {
  TheClawPacket,
  MainframeEvent,
  TeamMemberForOverlay,
} from "@whitep4nth3r/p4nth3rb0t-types";
import WebSocketServer from "../WebSocketServer";
import Team from "../users/Team";
import UserManager from "../users/UserManager";

export const sendTheClawEvent = async () => {
  const team = await Team.getMembers();

  const mergeTeamWithUserData = async (): Promise<TeamMemberForOverlay[]> => {
    const promises = team.map(async (member: TwitchUser) => {
      const user = await UserManager.getUserById(member.user_id);
      if (user) {
        return {
          displayName: member.user_name as string,
          logoUrl: user.profile_image_url as string,
        };
      }
    });

    return await Promise.all(promises);
  };

  const teamMembersToSend = await mergeTeamWithUserData();

  try {
    const clawEvent: TheClawPacket = {
      event: MainframeEvent.theClaw,
      id: "the-claw",
      data: {
        teamMembers: teamMembersToSend,
      },
    };

    WebSocketServer.sendData(clawEvent);
  } catch (error) {
    console.log(error);
  }
};

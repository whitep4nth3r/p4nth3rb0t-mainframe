import { Router, Request, Response } from "express";
import asyncWrapper from "../../utils/asyncWrapper";
import { sendLiveAnnouncement, sendOfflineAnnouncement } from "../../discord";
import { TeamMembers } from "../../data/types";
import Team from "../../users/Team";
import { config } from "../../config";
import { deploySite } from "../../utils/netlifyUtils";
import { verifyTwitchSignature } from "../../utils/verifyTwitchSignature";

const router = Router();

router.post(
  "/:member_id",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifyTwitchSignature(req);

    if (!valid) {
      return res.status(403).send();
    }

    const teamMembers: TeamMembers = await Team.getMembers();

    const member = teamMembers.find(
      (member) => member.user_id === req.params.member_id,
    );

    if (!member) {
      res.sendStatus(404);

      return;
    }

    const subType = req.body.subscription.type;

    if (req.body.challenge) {
      console.log(
        `↪️  Webhook subscribed for ${member.user_name} ${subType} events!`,
      );

      return res.status(200).contentType("text/plain").send(req.body.challenge);
    } else if (subType === "stream.offline") {
      console.log("🔔 Stream Offline notification received");

      await sendOfflineAnnouncement(req.params.member_id);

      if (req.params.member_id === config.broadcaster.user_id) {
        await deploySite();
      }
    } else if (subType === "stream.online") {
      console.log("🔔 Stream Online notification received");

      await sendLiveAnnouncement(req.body.event);

      if (req.body.event.broadcaster_user_id === config.broadcaster.user_id) {
        await deploySite();
      }
    }

    return res.status(200).send();
  }),
);

export default router;

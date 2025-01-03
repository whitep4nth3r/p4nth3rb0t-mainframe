import { Router, Request, Response } from "express";
import asyncWrapper from "../../utils/asyncWrapper";
import { sendBroadcasterFollowEvent } from "../../events/twitch/follows";
import { verifyTwitchSignature } from "../../utils/verifyTwitchSignature";

const router = Router();

router.post(
  "/",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifyTwitchSignature(req);

    if (!valid) {
      return res.status(403).send();
    }

    if (req.body.challenge) {
      console.log(`💘 Webhook subscribed for broadcaster follows!`);

      return res.status(200).contentType("text/plain").send(req.body.challenge);
    } else {
      console.log("🔔 Broadcaster follow received");

      await sendBroadcasterFollowEvent(
        req.body.event.user_name,
        req.body.event.user_id,
      );
    }

    return res.status(200).send();
  }),
);

export default router;

import { Router, Request, Response } from "express";
import asyncWrapper from "../../utils/asyncWrapper";
import { verifyTwitchSignature } from "../../utils/verifyTwitchSignature";
import {
  sendHypeTrainBeginEvent,
  sendHypeTrainEndEvent,
  sendHypeTrainProgressEvent,
} from "../../events/twitch/hype";

const router = Router();

router.post(
  "/begin",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifyTwitchSignature(req);

    if (!valid) {
      return res.status(403).send();
    }

    if (req.body.challenge) {
      console.log(`🚂  Webhook subscribed for hype train begin!`);

      return res.status(200).contentType("text/plain").send(req.body.challenge);
    } else {
      console.log("🚂 Hype train begin received");

      await sendHypeTrainBeginEvent(req.body.event.level);
    }

    return res.status(200).send();
  }),
);

router.post(
  "/progress",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifyTwitchSignature(req);

    if (!valid) {
      return res.status(403).send();
    }

    if (req.body.challenge) {
      console.log(`🚂  Webhook subscribed for hype train progress!`);

      return res.status(200).contentType("text/plain").send(req.body.challenge);
    } else {
      console.log("🚂 Hype train progress received");

      await sendHypeTrainProgressEvent(req.body.event.level);
    }

    return res.status(200).send();
  }),
);

router.post(
  "/end",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifyTwitchSignature(req);

    if (!valid) {
      return res.status(403).send();
    }

    if (req.body.challenge) {
      console.log(`🚂  Webhook subscribed for hype train end!`);

      return res.status(200).contentType("text/plain").send(req.body.challenge);
    } else {
      console.log("🚂 Hype train end received");

      await sendHypeTrainEndEvent(req.body.event.level);
    }

    return res.status(200).send();
  }),
);

export default router;

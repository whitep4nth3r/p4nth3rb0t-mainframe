import "./instrument";
import * as Sentry from "@sentry/node";
import express, { Request, Response } from "express";

import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import crypto from "crypto";
import asyncWrapper from "./utils/asyncWrapper";
import { sendLiveAnnouncement, sendOfflineAnnouncement } from "./discord";
import { sendBroadcasterFollowEvent } from "./events/twitch/follows";
import { TeamMembers } from "./data/types";
import Team from "./users/Team";
import AccessToken from "./classes/AccessToken";
import { deploySite } from "./utils/netlifyUtils";
import { config } from "./config";
import {
  sendHypeTrainBeginEvent,
  sendHypeTrainEndEvent,
  sendHypeTrainProgressEvent,
} from "./events/twitch/hype";
import { getFullInventory } from "./world/apiActions";
import { validateTwitchSession } from "./utils/twitchUtils";

const accessTokenUtil = new AccessToken();

const app = express();
app.use(bodyParser.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

function verifySignature(req: Request) {
  const messageId = req.header("Twitch-Eventsub-Message-Id") ?? "";
  const timestamp = req.header("Twitch-Eventsub-Message-Timestamp");
  const body = JSON.stringify(req.body);
  const hmac = crypto.createHmac("sha256", "sup3rs3cr3t");
  const data = hmac.update(messageId + timestamp + body);
  const signature = `sha256=${data.digest("hex")}`;
  const actualSignature = req.header("Twitch-Eventsub-Message-Signature");
  return signature === actualSignature;
}

app.get("/", (req: Request, res: Response) => {
  res.send("🔥 Welcome to the p4nth3rb0t mainframe");
});

app.get(
  "/authcode",
  asyncWrapper(async (req: Request, res: Response) => {
    const code = req.query.code;
    const scope = req.query.scope;

    // TODO Verify state matches the expected (stored in mongo, with expiry?)
    if (code) {
      try {
        await accessTokenUtil.setAuthCode({
          code: code as string,
          scope: scope as string,
        });
        console.log("Auth Code saved!");
      } catch (error) {
        Sentry.captureException(error);
      }
    }
    return res.status(200).send();
  }),
);

app.get(
  "/world/inventory/",
  asyncWrapper(async (req: Request, res: Response) => {
    const validSession: any = await validateTwitchSession(
      req.headers.token as string,
    );

    if (validSession.user_id) {
      const inventory = await getFullInventory(validSession.user_id);
      return res.json({ inventory });
    } else {
      return res.status(401).send();
    }
  }),
);

app.post(
  "/webhooks/subscribe/team/:member_id",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifySignature(req);
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

app.post(
  "/webhooks/subscribe/hype/begin",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifySignature(req);
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

app.post(
  "/webhooks/subscribe/hype/progress",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifySignature(req);
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

app.post(
  "/webhooks/subscribe/hype/end",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifySignature(req);
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

app.post(
  "/webhooks/subscribe/broadcaster/follow",
  asyncWrapper(async (req: Request, res: Response) => {
    const valid = verifySignature(req);
    if (!valid) {
      return res.status(403).send();
    }
    if (req.body.challenge) {
      console.log(`💘  Webhook subscribed for broadcaster follows!`);
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

Sentry.setupExpressErrorHandler(app);

export const webServer = http.createServer(app);

import express, {Request, Response} from "express";
import cors from "cors";
import http from "http";
import bodyParser from "body-parser";
import crypto from "crypto";
import asyncWrapper from "./utils/asyncWrapper";
import {sendBroadcasterFollowEvent} from "./events/follows";

const app = express();
app.use(bodyParser.json());

if (process.env.NODE_ENV !== "production") {
    app.use(
        cors({
            origin: "http://localhost:5000",
            credentials: true,
        }),
    );
}

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

app.post("/webhooks/subscribe/broadcaster/follow", asyncWrapper(async (req: Request, res: Response) => {
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
}));


app.use("/", (req: Request, res: Response) => {
    res.send("🔥 Welcome to the p4nth3rb0t mainframe");
});

export const webServer = http.createServer(app);

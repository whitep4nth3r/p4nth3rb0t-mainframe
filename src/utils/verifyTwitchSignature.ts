import { Request } from "express";
import crypto from "crypto";

const TWITCH_SECRET = "sup3rs3cr3t";

export function verifyTwitchSignature(req: Request): boolean {
  const messageId = req.header("Twitch-Eventsub-Message-Id") ?? "";
  const timestamp = req.header("Twitch-Eventsub-Message-Timestamp") ?? "";
  const body = JSON.stringify(req.body);

  const hmac = crypto.createHmac("sha256", TWITCH_SECRET);
  const data = hmac.update(messageId + timestamp + body);
  const signature = `sha256=${data.digest("hex")}`;
  const actualSignature = req.header("Twitch-Eventsub-Message-Signature");

  return signature === actualSignature;
}

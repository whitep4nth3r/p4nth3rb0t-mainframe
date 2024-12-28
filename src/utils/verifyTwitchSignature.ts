import { Request } from "express";
import crypto from "crypto";

export function verifyTwitchSignature(req: Request): boolean {
  const messageId = req.header("Twitch-Eventsub-Message-Id") ?? "";
  const timestamp = req.header("Twitch-Eventsub-Message-Timestamp") ?? "";
  const body = JSON.stringify(req.body);

  const hmac = crypto.createHmac(
    "sha256",
    process.env.TWITCH_SIGNATURE_SECRET || "sup3rs3cr3t",
  );
  const data = hmac.update(messageId + timestamp + body);
  const signature = `sha256=${data.digest("hex")}`;
  const actualSignature = req.header("Twitch-Eventsub-Message-Signature");

  return signature === actualSignature;
}

import mongoose, { Document, Schema } from "mongoose";

export interface DiscordAnnouncementData {
  memberId: string;
  messageId: string;
  streamId: string;
  category: string;
}

export interface DiscordAnnouncementDoc
    extends Document,
    DiscordAnnouncementData {}

export const DiscordAnnouncementSchema: Schema = new mongoose.Schema({
  memberId: { type: String, required: true, unique: true },
  messageId: { type: String, required: true },
  streamId: { type: String },
  category: { type: String },
});

export default mongoose.model<DiscordAnnouncementDoc>(
  "DiscordAnnouncement",
  DiscordAnnouncementSchema
);

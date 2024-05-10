import mongoose, { Document, Schema } from "mongoose";

export interface TwitchFollowerData {
  userId: string;
  userDisplayName: string;
}

export interface TwitchFollowerDoc extends Document, TwitchFollowerData {}

export const TwitchFollowerSchema: Schema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  userDisplayName: { type: String, required: true },
});

export default mongoose.model<TwitchFollowerDoc>(
  "TwitchFollower",
  TwitchFollowerSchema,
);

import mongoose, { Document, Schema } from "mongoose";

export interface PantherworldPlayerData {
  userId: string;
  userDisplayName: string;
  zone: string;
  createdAt: Date;
}

export interface PantherworldPlayerDoc
  extends Document,
    PantherworldPlayerData {}

export const PantherworldPlayerSchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, required: true, unique: true },
    userDisplayName: { type: String, required: true },
    zone: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<PantherworldPlayerDoc>(
  "PantherworldPlayer",
  PantherworldPlayerSchema,
);

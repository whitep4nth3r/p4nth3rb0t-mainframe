import mongoose, { Document, Schema } from "mongoose";

export interface PantherworldItemData {
  name: string;
  zone: string;
  userId: string;
}

export interface PantherworldItemDoc extends Document, PantherworldItemData {}

export const PantherworldItemSchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    name: { type: String, required: true },
    zone: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model<PantherworldItemDoc>(
  "PantherworldItem",
  PantherworldItemSchema,
);

import mongoose, { Document, Schema } from "mongoose";
import { PantherworldZoneNames } from "../../world/zones";

export interface PantherworldItemData {
  name: string;
  zone: keyof typeof PantherworldZoneNames; //?????
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

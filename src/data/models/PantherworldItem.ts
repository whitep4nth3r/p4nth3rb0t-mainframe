import mongoose, { Document, Schema } from "mongoose";
import { PantherworldZoneNames } from "../../world/zones";

export interface PantherworldItemData {
  userId: string;
  name: string;
  zone: keyof typeof PantherworldZoneNames;
  dropped: boolean;
  rarity: number;
}

export interface PantherworldItemDoc extends Document, PantherworldItemData {}

export const PantherworldItemSchema: Schema = new mongoose.Schema(
  {
    userId: { type: String, required: false },
    name: { type: String, required: true },
    zone: { type: String, required: true },
    dropped: { type: Boolean, required: false },
    rarity: { type: Number, required: true },
    cooked: { type: Boolean, required: false },
  },
  { timestamps: true },
);

export default mongoose.model<PantherworldItemDoc>(
  "PantherworldItem",
  PantherworldItemSchema,
);

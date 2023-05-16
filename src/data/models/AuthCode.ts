import mongoose, { Document, Schema } from "mongoose";

export interface AuthCodeData {
  code: string;
  scope: string;
}

export interface AuthCodeDoc extends Document, AuthCodeData {}

export const AuthCodeSchema: Schema = new mongoose.Schema({
  code: { type: String, required: true },
  scope: { type: String, required: true },
});

export default mongoose.model<AuthCodeDoc>("AuthCode", AuthCodeSchema);

import mongoose, { Document, Schema } from "mongoose";

export interface UserAccessTokenData {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
  updatedAt: number;
}

export interface UserAccessTokenDoc extends Document, UserAccessTokenData {}

export const UserAccessTokenSchema: Schema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String, required: true },
  tokenType: { type: String, required: true },
  expiresIn: { type: Number, required: true },
  updatedAt: { type: Number, required: true },
});

export default mongoose.model<UserAccessTokenDoc>("UserAccessToken", UserAccessTokenSchema);

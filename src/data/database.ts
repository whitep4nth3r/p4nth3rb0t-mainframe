import "dotenv/config";

import { DataSource } from "typeorm";
import { AccessToken } from "./entities/AccessTokenEntity";
import { AuthCode } from "./entities/AuthCodeEntity";
import { DiscordAnnouncement } from "./entities/DiscordAnnouncementEntity";
import { PantherworldItem } from "./entities/PantherworldItemEntity";
import { PantherworldPlayer } from "./entities/PantherworldPlayerEntity";
import { TwitchFollower } from "./entities/TwitchFollowerEntity";
import { UserAccessToken } from "./entities/UserAccessTokenEntity";

export const database = new DataSource({
  url: process.env.DATABASE_URL,
  type: "postgres",
  synchronize: false,
  useUTC: true,
  entities: [
    AccessToken,
    AuthCode,
    DiscordAnnouncement,
    PantherworldItem,
    PantherworldPlayer,
    TwitchFollower,
    UserAccessToken,
  ],
  migrations: ["./migrations/*.ts"],
});

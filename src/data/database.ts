import { config } from "dotenv";
import { DataSource } from "typeorm";

// This is here because we don't have environment variables from the project on the CLI
config();

export const database = new DataSource({
  url: process.env.DATABASE_URL,
  type: "postgres",
  synchronize: false,
  useUTC: true,
  logging: process.env.NODE_ENV !== "production" ? ["error"] : false,
  logger: "advanced-console",
  entities: ["./src/data/entities/*.ts"],
  migrations: ["./migrations/*.ts"],
});

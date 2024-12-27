import { MigrationInterface, QueryRunner } from "typeorm";

export class DiscordLink1735307107830 implements MigrationInterface {
    name = 'DiscordLink1735307107830'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "discord_user_link" ("id" SERIAL NOT NULL, "discordUserId" character varying(255) NOT NULL, "twitchUserId" character varying(255) NOT NULL, "twitchUserName" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_322e97286d64dc6d6aa78f803e1" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "discord_user_link"`);
    }

}

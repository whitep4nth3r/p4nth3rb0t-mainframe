import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1735936994525 implements MigrationInterface {
    name = 'InitialSchema1735936994525'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "twitch_follower" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(255) NOT NULL, "userDisplayName" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_8296288320af805f64c2111184b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" character varying(255) NOT NULL, "refreshToken" character varying(255) NOT NULL, "tokenType" character varying(50) NOT NULL, "expiresIn" integer NOT NULL, "scope" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_e22a5afad287e66ff09914a2a9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discord_user_link" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "discordId" character varying(255) NOT NULL, "twitchId" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "UQ_036fa911c5d940848ccacc6b857" UNIQUE ("discordId"), CONSTRAINT "PK_322e97286d64dc6d6aa78f803e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discord_user_note" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(255) NOT NULL, "note" text NOT NULL, "createdBy" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_9a44a01ca02db071b9c54545903" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discord_announcement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "memberId" character varying(255) NOT NULL, "messageId" character varying(255) NOT NULL, "streamId" character varying(255), "category" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_015006688bfe3019ca3d3759a66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" character varying(255) NOT NULL, "tokenType" character varying(255) NOT NULL, "expiresIn" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auth_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(255) NOT NULL, "scope" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_79343e6f9a8993c26d9047b480b" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "auth_code"`);
        await queryRunner.query(`DROP TABLE "access_token"`);
        await queryRunner.query(`DROP TABLE "discord_announcement"`);
        await queryRunner.query(`DROP TABLE "discord_user_note"`);
        await queryRunner.query(`DROP TABLE "discord_user_link"`);
        await queryRunner.query(`DROP TABLE "user_access_token"`);
        await queryRunner.query(`DROP TABLE "twitch_follower"`);
    }

}

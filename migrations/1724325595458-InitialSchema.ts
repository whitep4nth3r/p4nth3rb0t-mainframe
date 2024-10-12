import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1724325595458 implements MigrationInterface {
    name = 'InitialSchema1724325595458'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "twitch_follower" ("userId" character varying(255) NOT NULL, "userDisplayName" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_dae2b426db9d4d24520fe3b8f71" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TYPE "public"."pantherworld_item_zone_enum" AS ENUM('Beach', 'City', 'Forest', 'Mountain', 'Desert', 'Swamp')`);
        await queryRunner.query(`CREATE TABLE "pantherworld_item" ("id" SERIAL NOT NULL, "userId" uuid, "name" character varying(255) NOT NULL, "zone" "public"."pantherworld_item_zone_enum" NOT NULL, "dropped" boolean NOT NULL DEFAULT false, "rarity" integer NOT NULL, "cooked" boolean NOT NULL DEFAULT false, "used" boolean NOT NULL DEFAULT false, "spoiled" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), "userIdUserId" integer, CONSTRAINT "PK_eaa2acb6e6e8317097118c0b9aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pantherworld_player_zone_enum" AS ENUM('Beach', 'City', 'Forest', 'Mountain', 'Desert', 'Swamp')`);
        await queryRunner.query(`CREATE TABLE "pantherworld_player" ("userId" SERIAL NOT NULL, "userDisplayName" character varying(255) NOT NULL, "zone" "public"."pantherworld_player_zone_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "UQ_07cd2f779e93d94cd6618bda4c8" UNIQUE ("userDisplayName"), CONSTRAINT "PK_d22fc86f467f67333204665c275" PRIMARY KEY ("userId"))`);
        await queryRunner.query(`CREATE TABLE "user_access_token" ("id" SERIAL NOT NULL, "accessToken" character varying(255) NOT NULL, "refreshToken" character varying(255) NOT NULL, "tokenType" character varying(50) NOT NULL, "expiresIn" integer NOT NULL, "scope" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_e22a5afad287e66ff09914a2a9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discord_announcement" ("memberId" character varying(255) NOT NULL, "messageId" character varying(255) NOT NULL, "streamId" character varying(255), "category" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_8900bfc08d2fbd632e453dddb57" PRIMARY KEY ("memberId"))`);
        await queryRunner.query(`CREATE TABLE "auth_code" ("id" SERIAL NOT NULL, "code" character varying(255) NOT NULL, "scope" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_79343e6f9a8993c26d9047b480b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "access_token" ("id" SERIAL NOT NULL, "accessToken" character varying(255) NOT NULL, "tokenType" character varying(255) NOT NULL, "expiresIn" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pantherworld_item" ADD CONSTRAINT "FK_dd07b84bd17abf82f062fa6c949" FOREIGN KEY ("userIdUserId") REFERENCES "pantherworld_player"("userId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pantherworld_item" DROP CONSTRAINT "FK_dd07b84bd17abf82f062fa6c949"`);
        await queryRunner.query(`DROP TABLE "access_token"`);
        await queryRunner.query(`DROP TABLE "auth_code"`);
        await queryRunner.query(`DROP TABLE "discord_announcement"`);
        await queryRunner.query(`DROP TABLE "user_access_token"`);
        await queryRunner.query(`DROP TABLE "pantherworld_player"`);
        await queryRunner.query(`DROP TYPE "public"."pantherworld_player_zone_enum"`);
        await queryRunner.query(`DROP TABLE "pantherworld_item"`);
        await queryRunner.query(`DROP TYPE "public"."pantherworld_item_zone_enum"`);
        await queryRunner.query(`DROP TABLE "twitch_follower"`);
    }

}

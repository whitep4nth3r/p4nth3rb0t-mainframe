import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1737212830380 implements MigrationInterface {
    name = 'InitialSchema1737212830380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pantherworld_player_zone_enum" AS ENUM('Beach', 'City', 'Forest', 'Mountain', 'Desert', 'Swamp')`);
        await queryRunner.query(`CREATE TABLE "pantherworld_player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userDisplayName" character varying(255) NOT NULL, "zone" "public"."pantherworld_player_zone_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "UQ_07cd2f779e93d94cd6618bda4c8" UNIQUE ("userDisplayName"), CONSTRAINT "PK_d6e34748c0131113ab79b577c9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pantherworld_item_zone_enum" AS ENUM('Beach', 'City', 'Forest', 'Mountain', 'Desert', 'Swamp')`);
        await queryRunner.query(`CREATE TABLE "pantherworld_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "zone" "public"."pantherworld_item_zone_enum" NOT NULL, "dropped" boolean NOT NULL DEFAULT false, "rarity" integer NOT NULL, "cooked" boolean NOT NULL DEFAULT false, "used" boolean NOT NULL DEFAULT false, "spoiled" boolean NOT NULL DEFAULT false, "userId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_eaa2acb6e6e8317097118c0b9aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "twitch_follower" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" character varying(255) NOT NULL, "userDisplayName" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_8296288320af805f64c2111184b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" character varying(255) NOT NULL, "refreshToken" character varying(255) NOT NULL, "tokenType" character varying(50) NOT NULL, "expiresIn" integer NOT NULL, "scope" text NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_e22a5afad287e66ff09914a2a9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "access_token" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "accessToken" character varying(255) NOT NULL, "tokenType" character varying(255) NOT NULL, "expiresIn" integer NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_f20f028607b2603deabd8182d12" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "auth_code" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "code" character varying(255) NOT NULL, "scope" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_79343e6f9a8993c26d9047b480b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "discord_announcement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "memberId" character varying(255) NOT NULL, "messageId" character varying(255) NOT NULL, "streamId" character varying(255), "category" character varying(255), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_015006688bfe3019ca3d3759a66" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pantherworld_item" ADD CONSTRAINT "FK_14cb8b6157619b9baa97eeb6237" FOREIGN KEY ("userId") REFERENCES "pantherworld_player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pantherworld_item" DROP CONSTRAINT "FK_14cb8b6157619b9baa97eeb6237"`);
        await queryRunner.query(`DROP TABLE "discord_announcement"`);
        await queryRunner.query(`DROP TABLE "auth_code"`);
        await queryRunner.query(`DROP TABLE "access_token"`);
        await queryRunner.query(`DROP TABLE "user_access_token"`);
        await queryRunner.query(`DROP TABLE "twitch_follower"`);
        await queryRunner.query(`DROP TABLE "pantherworld_item"`);
        await queryRunner.query(`DROP TYPE "public"."pantherworld_item_zone_enum"`);
        await queryRunner.query(`DROP TABLE "pantherworld_player"`);
        await queryRunner.query(`DROP TYPE "public"."pantherworld_player_zone_enum"`);
    }

}

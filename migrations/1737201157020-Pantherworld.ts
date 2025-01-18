import { MigrationInterface, QueryRunner } from "typeorm";

export class Pantherworld1737201157020 implements MigrationInterface {
    name = 'Pantherworld1737201157020'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."pantherworld_item_zone_enum" AS ENUM('Beach', 'City', 'Forest', 'Mountain', 'Desert', 'Swamp')`);
        await queryRunner.query(`CREATE TABLE "pantherworld_item" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(255) NOT NULL, "zone" "public"."pantherworld_item_zone_enum" NOT NULL, "dropped" boolean NOT NULL DEFAULT false, "rarity" integer NOT NULL, "cooked" boolean NOT NULL DEFAULT false, "used" boolean NOT NULL DEFAULT false, "spoiled" boolean NOT NULL DEFAULT false, "userId" uuid, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_eaa2acb6e6e8317097118c0b9aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."pantherworld_player_zone_enum" AS ENUM('Beach', 'City', 'Forest', 'Mountain', 'Desert', 'Swamp')`);
        await queryRunner.query(`CREATE TABLE "pantherworld_player" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userDisplayName" character varying(255) NOT NULL, "zone" "public"."pantherworld_player_zone_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "UQ_07cd2f779e93d94cd6618bda4c8" UNIQUE ("userDisplayName"), CONSTRAINT "PK_d6e34748c0131113ab79b577c9d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "pantherworld_item" ADD CONSTRAINT "FK_14cb8b6157619b9baa97eeb6237" FOREIGN KEY ("userId") REFERENCES "pantherworld_player"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "pantherworld_item" DROP CONSTRAINT "FK_14cb8b6157619b9baa97eeb6237"`);
        await queryRunner.query(`DROP TABLE "pantherworld_player"`);
        await queryRunner.query(`DROP TYPE "public"."pantherworld_player_zone_enum"`);
        await queryRunner.query(`DROP TABLE "pantherworld_item"`);
        await queryRunner.query(`DROP TYPE "public"."pantherworld_item_zone_enum"`);
    }

}

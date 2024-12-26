import { MigrationInterface, QueryRunner } from "typeorm";

export class DiscordUserNote1735218036695 implements MigrationInterface {
    name = 'DiscordUserNote1735218036695'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "discord_user_note" ("id" SERIAL NOT NULL, "userId" character varying(255) NOT NULL, "note" text NOT NULL, "createdBy" character varying(255) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT now(), CONSTRAINT "PK_9a44a01ca02db071b9c54545903" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "discord_user_note"`);
    }

}

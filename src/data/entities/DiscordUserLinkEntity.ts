import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class DiscordUserLink extends BaseEntity {
  @Column({
    type: "varchar",
    length: 255,
    unique: true,
  })
  discordId!: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  twitchId?: string;
}

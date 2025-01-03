import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class DiscordAnnouncement extends BaseEntity {
  @Column({
    type: "varchar",
    length: 255,
  })
  memberId: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  messageId: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  streamId: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: true,
  })
  category: string;
}

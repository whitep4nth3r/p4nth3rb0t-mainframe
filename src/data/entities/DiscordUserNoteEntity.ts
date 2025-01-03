import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class DiscordUserNote extends BaseEntity {
  @Column({
    type: "varchar",
    length: 255,
  })
  userId: string;

  @Column({
    type: "text",
    nullable: false,
  })
  note: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  createdBy: string;
}

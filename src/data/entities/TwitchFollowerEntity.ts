import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class TwitchFollower extends BaseEntity {
  @Column({
    type: "varchar",
    length: 255,
  })
  userId!: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  userDisplayName: string;
}

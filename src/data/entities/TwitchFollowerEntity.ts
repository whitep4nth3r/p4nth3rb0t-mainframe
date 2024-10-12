import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class TwitchFollower {
  @PrimaryColumn({
    type: "varchar",
    length: 255,
  })
  userId: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  userDisplayName: string;

  @CreateDateColumn({
    type: "timestamp with time zone",
    nullable: false,
  })
  createdAt: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
    nullable: true,
    default: false,
  })
  updatedAt?: Date;
}

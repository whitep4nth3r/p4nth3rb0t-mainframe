import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class DiscordAnnouncement {
  @PrimaryColumn({
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

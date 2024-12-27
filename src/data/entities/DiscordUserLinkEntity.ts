import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class DiscordUserLink {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  discordUserId: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  twitchUserId: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  twitchUserName: string;

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

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
  id!: number;

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

  @CreateDateColumn({
    type: "timestamp with time zone",
    nullable: false,
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: "timestamp with time zone",
    nullable: true,
    default: false,
  })
  updatedAt?: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class DiscordUserNote {
  @PrimaryGeneratedColumn()
  id: string;

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

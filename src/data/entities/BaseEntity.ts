import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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

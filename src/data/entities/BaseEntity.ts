import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

export abstract class BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @CreateDateColumn({
    name: "createdAt",
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
  })
  readonly createdAt!: Date;

  @UpdateDateColumn({
    name: "updatedAt",
    type: "timestamptz",
    onUpdate: "CURRENT_TIMESTAMP",
    nullable: true,
  })
  readonly updatedAt?: Date;
}

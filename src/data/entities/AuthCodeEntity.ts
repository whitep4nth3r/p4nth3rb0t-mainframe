import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class AuthCode {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  code: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  scope: string;

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

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class AccessToken {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  accessToken: string;

  @Column({
    type: "varchar",
    length: 255,
    nullable: false,
  })
  tokenType: string;

  @Column({
    type: "int",
    nullable: false,
  })
  expiresIn: number;

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

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class UserAccessToken {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  accessToken: string;

  @Column({
    type: "varchar",
    length: 255,
  })
  refreshToken: string;

  @Column({
    type: "varchar",
    length: 50,
  })
  tokenType: string;

  @Column({
    type: "int",
  })
  expiresIn: number;

  @Column({
    type: "simple-array",
  })
  scope: string[];

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

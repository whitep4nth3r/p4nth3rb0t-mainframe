import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class UserAccessToken extends BaseEntity {
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
}

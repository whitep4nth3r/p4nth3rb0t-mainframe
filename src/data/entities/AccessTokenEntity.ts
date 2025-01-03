import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class AccessToken extends BaseEntity {
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
}

import { Column, Entity } from "typeorm";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class AuthCode extends BaseEntity {
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
}

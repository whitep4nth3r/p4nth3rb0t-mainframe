import { Column, Entity, OneToMany } from "typeorm";
import { PantherworldZoneNames } from "../../world/zones";
import { PantherworldItem } from "./PantherworldItemEntity";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class PantherworldPlayer extends BaseEntity {
  @Column({
    type: "varchar",
    length: 255,
    unique: true,
  })
  userDisplayName: string;

  @Column({
    name: "zone",
    type: "enum",
    enum: Object.keys(PantherworldZoneNames),
  })
  zone: keyof typeof PantherworldZoneNames;

  @OneToMany(() => PantherworldItem, (item) => item.userId)
  items: PantherworldItem[];
}

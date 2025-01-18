import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { PantherworldZoneNames } from "../../world/zones";
import { PantherworldPlayer } from "./PantherworldPlayerEntity";
import { BaseEntity } from "./BaseEntity";

@Entity()
export class PantherworldItem extends BaseEntity {
  @ManyToOne(() => PantherworldPlayer, (player) => player.items, {
    nullable: true,
  })
  @JoinColumn({ name: "userId" })
  userId: PantherworldPlayer;

  @Column({
    type: "varchar",
    length: 255,
  })
  name: string;

  @Column({
    name: "zone",
    type: "enum",
    enum: Object.keys(PantherworldZoneNames),
  })
  zone: keyof typeof PantherworldZoneNames;

  @Column({
    type: "boolean",
    default: false,
  })
  dropped: boolean;

  @Column({
    type: "int",
  })
  rarity: number;

  @Column({
    type: "boolean",
    default: false,
  })
  cooked: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  used: boolean;

  @Column({
    type: "boolean",
    default: false,
  })
  spoiled: boolean;
}

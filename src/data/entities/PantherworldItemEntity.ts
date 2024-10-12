import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PantherworldZoneNames } from "../../world/zones";
import { PantherworldPlayer } from "./PantherworldPlayerEntity";

@Entity()
export class PantherworldItem {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({
    type: "uuid",
    nullable: true,
  })
  @ManyToOne(() => PantherworldPlayer, (player) => player.items, {
    nullable: true,
  })
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

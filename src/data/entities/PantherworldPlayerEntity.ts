import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { PantherworldZoneNames } from "../../world/zones";
import { PantherworldItem } from "./PantherworldItemEntity";

@Entity()
export class PantherworldPlayer {
  @PrimaryGeneratedColumn()
  userId: string;

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

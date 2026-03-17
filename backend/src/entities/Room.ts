import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Wall } from './Wall';
import { DimensionSegment } from './DimensionSegment';

@Entity('room')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  label!: string;

  @Column({ type: 'varchar', length: 100, nullable: false })
  floor!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Wall, (wall) => wall.room, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  walls!: Wall[];

  @OneToMany(() => DimensionSegment, (segment) => segment.room, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  dimensionSegments!: DimensionSegment[];
}

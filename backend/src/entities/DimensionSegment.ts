import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Room } from './Room';

export type SurfaceType = 'floor' | 'ceiling';

@Entity('dimension_segment')
export class DimensionSegment {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  label!: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  measurement!: number;

  @Column({ type: 'enum', enum: ['floor', 'ceiling'], nullable: false })
  surfaceType!: SurfaceType;

  @Column({ nullable: false })
  roomId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => Room, (room) => room.dimensionSegments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;
}

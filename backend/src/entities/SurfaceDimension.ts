import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SurfaceType } from './DimensionSegment';
import { Room } from './Room';

@Entity('surface_dimension')
@Unique(['roomId', 'surfaceType'])
export class SurfaceDimension {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'enum', enum: ['floor', 'ceiling'], nullable: false })
  surfaceType!: SurfaceType;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  width!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  length!: number;

  @Column({ nullable: false })
  roomId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Room, (room) => room.surfaceDimensions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;
}

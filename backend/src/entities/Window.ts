import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Wall } from './Wall';

@Entity('window')
export class Window {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  label!: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  width!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  height!: number;

  @Column({ nullable: false })
  wallId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Wall, (wall) => wall.windows, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallId' })
  wall!: Wall;
}

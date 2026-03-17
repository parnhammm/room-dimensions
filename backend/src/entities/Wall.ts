import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Room } from './Room';
import { Window } from './Window';

@Entity('wall')
export class Wall {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  label!: string;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  width!: number;

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: false })
  height!: number;

  @Column({ nullable: false })
  roomId!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @ManyToOne(() => Room, (room) => room.walls, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @OneToMany(() => Window, (window) => window.wall, {
    cascade: ['insert', 'update', 'remove'],
    onDelete: 'CASCADE',
  })
  windows!: Window[];
}

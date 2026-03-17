import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';
import { MeasurementUnit } from '../constants/units';

@Entity('app_settings')
export class AppSettings {
  @PrimaryColumn({ type: 'int' })
  id!: number;

  @Column({
    type: 'enum',
    enum: ['m', 'cm', 'ft', 'in'],
    default: 'm',
    nullable: false,
  })
  measurementUnit!: MeasurementUnit;

  @UpdateDateColumn()
  updatedAt!: Date;
}

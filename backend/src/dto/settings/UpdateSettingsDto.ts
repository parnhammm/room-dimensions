import { IsIn } from 'class-validator';
import { MEASUREMENT_UNITS, MeasurementUnit } from '../../constants/units';

export class UpdateSettingsDto {
  @IsIn(MEASUREMENT_UNITS)
  measurementUnit!: MeasurementUnit;
}

import { AppSettings } from '../entities/AppSettings';
import { MeasurementUnit } from '../constants/units';

export interface IAppSettingsRepository {
  findSingleton(): Promise<AppSettings>;
  upsert(unit: MeasurementUnit): Promise<AppSettings>;
}

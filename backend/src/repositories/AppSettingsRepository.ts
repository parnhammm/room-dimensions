import { DataSource, Repository } from 'typeorm';
import { AppSettings } from '../entities/AppSettings';
import { IAppSettingsRepository } from './IAppSettingsRepository';
import { MeasurementUnit } from '../constants/units';

const SINGLETON_ID = 1;

export class AppSettingsRepository implements IAppSettingsRepository {
  private readonly repo: Repository<AppSettings>;

  constructor(dataSource: DataSource) {
    this.repo = dataSource.getRepository(AppSettings);
  }

  async findSingleton(): Promise<AppSettings> {
    const settings = await this.repo.findOne({ where: { id: SINGLETON_ID } });
    if (!settings) {
      return this.repo.save({ id: SINGLETON_ID, measurementUnit: 'm' as MeasurementUnit });
    }
    return settings;
  }

  async upsert(unit: MeasurementUnit): Promise<AppSettings> {
    await this.repo.upsert({ id: SINGLETON_ID, measurementUnit: unit }, ['id']);
    return this.findSingleton();
  }
}

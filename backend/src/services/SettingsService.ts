import { IAppSettingsRepository } from '../repositories/IAppSettingsRepository';
import { SettingsResponseDto } from '../dto/settings/SettingsResponseDto';
import { UpdateSettingsDto } from '../dto/settings/UpdateSettingsDto';

export class SettingsService {
  constructor(private readonly settingsRepo: IAppSettingsRepository) {}

  async getSettings(): Promise<SettingsResponseDto> {
    const settings = await this.settingsRepo.findSingleton();
    return { measurementUnit: settings.measurementUnit };
  }

  async updateSettings(dto: UpdateSettingsDto): Promise<SettingsResponseDto> {
    const settings = await this.settingsRepo.upsert(dto.measurementUnit);
    return { measurementUnit: settings.measurementUnit };
  }
}

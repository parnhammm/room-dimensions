import { SettingsService } from '../../src/services/SettingsService';
import { IAppSettingsRepository } from '../../src/repositories/IAppSettingsRepository';
import { AppSettings } from '../../src/entities/AppSettings';

function mockRepo(overrides: Partial<IAppSettingsRepository> = {}): IAppSettingsRepository {
  return {
    findSingleton: jest.fn().mockResolvedValue({ measurementUnit: 'm' } as AppSettings),
    upsert: jest.fn().mockResolvedValue({ measurementUnit: 'ft' } as AppSettings),
    ...overrides,
  };
}

describe('SettingsService', () => {
  describe('getSettings', () => {
    it('returns the current measurement unit from the repo', async () => {
      const service = new SettingsService(mockRepo());
      const result = await service.getSettings();
      expect(result.measurementUnit).toBe('m');
    });

    it('propagates repo errors', async () => {
      const repo = mockRepo({ findSingleton: jest.fn().mockRejectedValue(new Error('db error')) });
      const service = new SettingsService(repo);
      await expect(service.getSettings()).rejects.toThrow('db error');
    });
  });

  describe('updateSettings', () => {
    it('calls upsert with the new unit and returns the updated dto', async () => {
      const repo = mockRepo();
      const service = new SettingsService(repo);
      const result = await service.updateSettings({ measurementUnit: 'ft' });
      expect(repo.upsert).toHaveBeenCalledWith('ft');
      expect(result.measurementUnit).toBe('ft');
    });

    it('propagates repo errors', async () => {
      const repo = mockRepo({ upsert: jest.fn().mockRejectedValue(new Error('db error')) });
      const service = new SettingsService(repo);
      await expect(service.updateSettings({ measurementUnit: 'ft' })).rejects.toThrow('db error');
    });
  });
});

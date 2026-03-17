import { DataSource, Repository } from 'typeorm';
import { AppSettingsRepository } from '../AppSettingsRepository';
import { AppSettings } from '../../entities/AppSettings';

function makeMockRepo(overrides: Partial<Repository<AppSettings>> = {}): Repository<AppSettings> {
  return {
    findOne: jest.fn().mockResolvedValue(null),
    save: jest.fn(),
    upsert: jest.fn().mockResolvedValue(undefined),
    ...overrides,
  } as unknown as Repository<AppSettings>;
}

function makeMockDataSource(mockRepo: Repository<AppSettings>): DataSource {
  return { getRepository: jest.fn().mockReturnValue(mockRepo) } as unknown as DataSource;
}

describe('AppSettingsRepository', () => {
  it('findSingleton returns default when absent', async () => {
    const defaultSettings = { id: 1, measurementUnit: 'm' } as AppSettings;
    const mockRepo = makeMockRepo({
      findOne: jest.fn().mockResolvedValue(null),
      save: jest.fn().mockResolvedValue(defaultSettings),
    });
    const repo = new AppSettingsRepository(makeMockDataSource(mockRepo));
    const result = await repo.findSingleton();
    expect(result).toEqual(defaultSettings);
    expect(mockRepo.save).toHaveBeenCalledWith({ id: 1, measurementUnit: 'm' });
  });

  it('findSingleton returns existing when present', async () => {
    const existing = { id: 1, measurementUnit: 'ft' } as AppSettings;
    const mockRepo = makeMockRepo({ findOne: jest.fn().mockResolvedValue(existing) });
    const repo = new AppSettingsRepository(makeMockDataSource(mockRepo));
    const result = await repo.findSingleton();
    expect(result).toEqual(existing);
  });

  it('upsert calls repo.upsert and returns updated settings', async () => {
    const updated = { id: 1, measurementUnit: 'cm' } as AppSettings;
    const mockRepo = makeMockRepo({
      upsert: jest.fn().mockResolvedValue(undefined),
      findOne: jest.fn().mockResolvedValue(updated),
    });
    const repo = new AppSettingsRepository(makeMockDataSource(mockRepo));
    const result = await repo.upsert('cm');
    expect(mockRepo.upsert).toHaveBeenCalledWith({ id: 1, measurementUnit: 'cm' }, ['id']);
    expect(result).toEqual(updated);
  });
});

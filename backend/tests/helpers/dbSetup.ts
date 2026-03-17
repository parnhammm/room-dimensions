import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Room } from '../../src/entities/Room';
import { Wall } from '../../src/entities/Wall';
import { Window } from '../../src/entities/Window';
import { DimensionSegment } from '../../src/entities/DimensionSegment';
import { AppSettings } from '../../src/entities/AppSettings';

let testDataSource: DataSource | null = null;

export async function setupTestDb(): Promise<DataSource> {
  if (testDataSource && testDataSource.isInitialized) {
    return testDataSource;
  }

  testDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: parseInt(process.env.DB_PORT ?? '3307', 10),
    username: process.env.DB_USERNAME ?? 'root',
    password: process.env.DB_PASSWORD ?? 'testpassword',
    database: process.env.DB_DATABASE ?? 'room_dimensions_test',
    synchronize: false,
    logging: false,
    entities: [Room, Wall, Window, DimensionSegment, AppSettings],
    migrations: [__dirname + '/../../src/migrations/*.{ts,js}'],
  });

  await testDataSource.initialize();
  await testDataSource.runMigrations();
  return testDataSource;
}

export async function teardownTestDb(): Promise<void> {
  if (!testDataSource || !testDataSource.isInitialized) return;

  // Truncate in FK-safe order
  await testDataSource.query('SET FOREIGN_KEY_CHECKS = 0');
  await testDataSource.query('TRUNCATE TABLE window');
  await testDataSource.query('TRUNCATE TABLE wall');
  await testDataSource.query('TRUNCATE TABLE dimension_segment');
  await testDataSource.query('TRUNCATE TABLE room');
  await testDataSource.query('TRUNCATE TABLE app_settings');
  await testDataSource.query('SET FOREIGN_KEY_CHECKS = 1');

  await testDataSource.destroy();
  testDataSource = null;
}

export function getTestDataSource(): DataSource {
  if (!testDataSource || !testDataSource.isInitialized) {
    throw new Error('Test database not initialized. Call setupTestDb() first.');
  }
  return testDataSource;
}

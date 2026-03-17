import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AppDataSource } from '../../src/config/dataSource';
import { Room } from '../../src/entities/Room';
import { Wall } from '../../src/entities/Wall';
import { Window } from '../../src/entities/Window';
import { DimensionSegment } from '../../src/entities/DimensionSegment';
import { SurfaceDimension } from '../../src/entities/SurfaceDimension';
import { AppSettings } from '../../src/entities/AppSettings';

let testDataSource: DataSource | null = null;

async function truncateAll(ds: DataSource): Promise<void> {
  await ds.query('SET FOREIGN_KEY_CHECKS = 0');
  await ds.query('TRUNCATE TABLE `window`');
  await ds.query('TRUNCATE TABLE wall');
  await ds.query('TRUNCATE TABLE dimension_segment');
  await ds.query('TRUNCATE TABLE surface_dimension');
  await ds.query('TRUNCATE TABLE room');
  await ds.query('TRUNCATE TABLE app_settings');
  await ds.query('SET FOREIGN_KEY_CHECKS = 1');
}

export async function setupTestDb(): Promise<DataSource> {
  if (testDataSource && testDataSource.isInitialized) {
    // Already connected — just clean the tables for this suite
    await truncateAll(testDataSource);
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
    entities: [Room, Wall, Window, DimensionSegment, SurfaceDimension, AppSettings],
    migrations: [__dirname + '/../../src/migrations/*.{ts,js}'],
  });

  await testDataSource.initialize();
  await testDataSource.runMigrations();
  await truncateAll(testDataSource);

  // AppDataSource is used by HTTP routes in createApp(). With setTestEnv.ts injecting
  // test DB env vars before module load, AppDataSource already points to the test DB.
  if (!AppDataSource.isInitialized) {
    await AppDataSource.initialize();
  }

  return testDataSource;
}

export async function teardownTestDb(): Promise<void> {
  if (!testDataSource || !testDataSource.isInitialized) return;

  await truncateAll(testDataSource);
  await testDataSource.destroy();
  testDataSource = null;

  if (AppDataSource.isInitialized) {
    await AppDataSource.destroy();
  }
}

export function getTestDataSource(): DataSource {
  if (!testDataSource || !testDataSource.isInitialized) {
    throw new Error('Test database not initialized. Call setupTestDb() first.');
  }
  return testDataSource;
}

import 'reflect-metadata';
import { AppDataSource } from './config/dataSource';
import createApp from './app';
import { env } from './config/env';
import { logger } from './middleware/requestLogger';

async function main(): Promise<void> {
  await AppDataSource.initialize();
  await AppDataSource.runMigrations();
  logger.info('Database connected and migrations run');

  const app = createApp();
  app.listen(env.API_PORT, () => {
    logger.info(`Server running on port ${env.API_PORT}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server', err);
  process.exit(1);
});

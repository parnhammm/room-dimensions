import 'reflect-metadata';
import express, { Application } from 'express';
import { requestLogger } from './middleware/requestLogger';
import { errorHandler } from './middleware/errorHandler';
import { env } from './config/env';
import roomsRouter from './routes/rooms';
import segmentsRouter from './routes/segments';
import wallsRouter from './routes/walls';
import windowsRouter from './routes/windows';
import settingsRouter from './routes/settings';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import fs from 'fs';

function createApp(): Application {
  const app = express();

  app.use(requestLogger);
  app.use(express.json());

  app.use('/api/v1/rooms', roomsRouter);
  app.use('/api/v1/rooms', segmentsRouter);
  app.use('/api/v1/rooms', wallsRouter);
  app.use('/api/v1/rooms', windowsRouter);
  app.use('/api/v1/settings', settingsRouter);

  if (env.NODE_ENV !== 'production') {
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: { title: 'Room Dimensions API', version: '1.0.0' },
        servers: [{ url: '/api/v1' }],
      },
      apis: [path.join(__dirname, './routes/*.js'), path.join(__dirname, './routes/*.ts')],
    };
    const swaggerSpec = swaggerJsdoc(swaggerOptions);
    const specPath = path.join(__dirname, 'openapi.json');
    fs.writeFileSync(specPath, JSON.stringify(swaggerSpec, null, 2));
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  }

  app.use(errorHandler);

  return app;
}

export default createApp;

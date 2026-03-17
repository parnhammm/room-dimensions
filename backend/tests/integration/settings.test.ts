import 'reflect-metadata';
import request from 'supertest';
import { setupTestDb, teardownTestDb } from '../helpers/dbSetup';
import createApp from '../../src/app';
import { Application } from 'express';

let app: Application;

beforeAll(async () => {
  await setupTestDb();
  app = createApp();
}, 30000);

afterAll(() => teardownTestDb());

describe('GET /api/v1/settings', () => {
  it('returns current measurement unit', async () => {
    const res = await request(app).get('/api/v1/settings');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('measurementUnit');
  });
});

describe('PATCH /api/v1/settings', () => {
  it('updates measurement unit to ft', async () => {
    const res = await request(app).patch('/api/v1/settings').send({ measurementUnit: 'ft' });
    expect(res.status).toBe(200);
    expect(res.body.measurementUnit).toBe('ft');
  });

  it('returns 400 for invalid unit', async () => {
    const res = await request(app).patch('/api/v1/settings').send({ measurementUnit: 'km' });
    expect(res.status).toBe(400);
  });
});

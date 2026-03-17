import 'reflect-metadata';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb } from '../helpers/dbSetup';
import createApp from '../../src/app';
import { Application } from 'express';

let app: Application;
let dataSource: DataSource;
let roomId: number;
let wallId: number;

beforeAll(async () => {
  dataSource = await setupTestDb();
  app = createApp();
  const r = await request(app).post('/api/v1/rooms').send({ label: 'Win Room', floor: 'G' });
  roomId = r.body.id;
  const w = await request(app).post(`/api/v1/rooms/${roomId}/walls`).send({ label: 'W1', width: 5, height: 2 });
  wallId = w.body.id;
}, 30000);

afterAll(() => teardownTestDb());

describe('Windows API', () => {
  it('GET returns empty array', async () => {
    const r = await request(app).get(`/api/v1/rooms/${roomId}/walls/${wallId}/windows`);
    expect(r.status).toBe(200);
    expect(r.body).toEqual([]);
  });

  it('POST creates window', async () => {
    const start = Date.now();
    const r = await request(app).post(`/api/v1/rooms/${roomId}/walls/${wallId}/windows`).send({ label: 'Bay', width: 1.2, height: 1.0 });
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r.status).toBe(201);
    expect(r.body.label).toBe('Bay');
  });

  it('PATCH updates window', async () => {
    const cr = await request(app).post(`/api/v1/rooms/${roomId}/walls/${wallId}/windows`).send({ label: 'Old', width: 1, height: 1 });
    const winId = cr.body.id;
    const start = Date.now();
    const r = await request(app).patch(`/api/v1/rooms/${roomId}/walls/${wallId}/windows/${winId}`).send({ height: 1.5 });
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r.status).toBe(200);
    expect(Number(r.body.height)).toBe(1.5);
  });

  it('DELETE removes window but wall intact', async () => {
    const cr = await request(app).post(`/api/v1/rooms/${roomId}/walls/${wallId}/windows`).send({ label: 'Del', width: 1, height: 1 });
    const winId = cr.body.id;
    const dr = await request(app).delete(`/api/v1/rooms/${roomId}/walls/${wallId}/windows/${winId}`);
    expect(dr.status).toBe(204);
    const wr = await request(app).get(`/api/v1/rooms/${roomId}/walls/${wallId}`);
    expect(wr.status).toBe(200);
  });

  it('verifies isolation between walls', async () => {
    const w2 = await request(app).post(`/api/v1/rooms/${roomId}/walls`).send({ label: 'W2', width: 3, height: 2 });
    const r = await request(app).get(`/api/v1/rooms/${roomId}/walls/${w2.body.id}/windows`);
    expect(r.body).toEqual([]);
  });
});

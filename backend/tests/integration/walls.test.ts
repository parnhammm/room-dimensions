import 'reflect-metadata';
import request from 'supertest';
import { setupTestDb, teardownTestDb } from '../helpers/dbSetup';
import createApp from '../../src/app';
import { Application } from 'express';

let app: Application;
let roomId: number;

beforeAll(async () => {
  await setupTestDb();
  app = createApp();
  const r = await request(app).post('/api/v1/rooms').send({ label: 'Wall Room', floor: 'G' });
  roomId = r.body.id;
}, 30000);

afterAll(() => teardownTestDb());

// eslint-disable-next-line max-lines-per-function
describe('Walls API', () => {
  it('GET returns empty array', async () => {
    const start = Date.now();
    const r = await request(app).get(`/api/v1/rooms/${roomId}/walls`);
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r.status).toBe(200);
    expect(r.body).toEqual([]);
  });

  it('POST creates wall', async () => {
    const start = Date.now();
    const r = await request(app).post(`/api/v1/rooms/${roomId}/walls`).send({ label: 'South', width: 5.0, height: 2.4 });
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r.status).toBe(201);
    expect(r.body.label).toBe('South');
  });

  it('POST 400 for missing label', async () => {
    const r = await request(app).post(`/api/v1/rooms/${roomId}/walls`).send({ width: 5, height: 2 });
    expect(r.status).toBe(400);
  });

  it('POST 400 for zero width', async () => {
    const r = await request(app).post(`/api/v1/rooms/${roomId}/walls`).send({ label: 'X', width: 0, height: 2 });
    expect(r.status).toBe(400);
  });

  it('GET /:wallId returns detail with windows', async () => {
    const cr = await request(app).post(`/api/v1/rooms/${roomId}/walls`).send({ label: 'West', width: 3, height: 2 });
    const wallId = cr.body.id;
    const r = await request(app).get(`/api/v1/rooms/${roomId}/walls/${wallId}`);
    expect(r.status).toBe(200);
    expect(r.body.windows).toEqual([]);
  });

  it('PATCH updates wall', async () => {
    const cr = await request(app).post(`/api/v1/rooms/${roomId}/walls`).send({ label: 'Old', width: 3, height: 2 });
    const wallId = cr.body.id;
    const start = Date.now();
    const r = await request(app).patch(`/api/v1/rooms/${roomId}/walls/${wallId}`).send({ label: 'New' });
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r.status).toBe(200);
    expect(r.body.label).toBe('New');
  });

  it('DELETE cascades windows', async () => {
    const cr = await request(app).post(`/api/v1/rooms/${roomId}/walls`).send({ label: 'Del', width: 3, height: 2 });
    const wallId = cr.body.id;
    await request(app).post(`/api/v1/rooms/${roomId}/walls/${wallId}/windows`).send({ label: 'W1', width: 1, height: 1 });
    const dr = await request(app).delete(`/api/v1/rooms/${roomId}/walls/${wallId}`);
    expect(dr.status).toBe(204);
    const gr = await request(app).get(`/api/v1/rooms/${roomId}/walls/${wallId}`);
    expect(gr.status).toBe(404);
  });

  it('returns 404 for non-existent wall', async () => {
    expect((await request(app).get(`/api/v1/rooms/${roomId}/walls/99999`)).status).toBe(404);
  });
});

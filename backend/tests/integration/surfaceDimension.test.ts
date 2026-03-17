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
  const r = await request(app).post('/api/v1/rooms').send({ label: 'Dimension Room', floor: 'G' });
  roomId = r.body.id;
}, 30000);

afterAll(() => teardownTestDb());

// eslint-disable-next-line max-lines-per-function
describe('Floor Dimensions API', () => {
  it('GET returns 404 when not set', async () => {
    const r = await request(app).get(`/api/v1/rooms/${roomId}/floor-dimensions`);
    expect(r.status).toBe(404);
  });

  it('PUT creates floor dimension and returns 200', async () => {
    const start = Date.now();
    const r = await request(app)
      .put(`/api/v1/rooms/${roomId}/floor-dimensions`)
      .send({ width: 5.0, length: 4.2 });
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r.status).toBe(200);
    expect(r.body.surfaceType).toBe('floor');
    expect(Number(r.body.width)).toBe(5.0);
    expect(Number(r.body.length)).toBe(4.2);
    expect(r.body.roomId).toBe(roomId);
  });

  it('PUT updates existing floor dimension and returns 200', async () => {
    const start = Date.now();
    const r = await request(app)
      .put(`/api/v1/rooms/${roomId}/floor-dimensions`)
      .send({ width: 5.5, length: 4.2 });
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r.status).toBe(200);
    expect(Number(r.body.width)).toBe(5.5);
  });

  it('GET returns 200 after PUT', async () => {
    const r = await request(app).get(`/api/v1/rooms/${roomId}/floor-dimensions`);
    expect(r.status).toBe(200);
    expect(r.body.surfaceType).toBe('floor');
  });

  it('PUT returns 400 for missing width', async () => {
    const r = await request(app)
      .put(`/api/v1/rooms/${roomId}/floor-dimensions`)
      .send({ length: 4.2 });
    expect(r.status).toBe(400);
  });

  it('PUT returns 400 for zero width', async () => {
    const r = await request(app)
      .put(`/api/v1/rooms/${roomId}/floor-dimensions`)
      .send({ width: 0, length: 4.2 });
    expect(r.status).toBe(400);
  });

  it('PUT returns 400 for negative length', async () => {
    const r = await request(app)
      .put(`/api/v1/rooms/${roomId}/floor-dimensions`)
      .send({ width: 5, length: -1 });
    expect(r.status).toBe(400);
  });

  it('DELETE returns 204', async () => {
    const r = await request(app).delete(`/api/v1/rooms/${roomId}/floor-dimensions`);
    expect(r.status).toBe(204);
  });

  it('DELETE returns 404 when not set', async () => {
    const r = await request(app).delete(`/api/v1/rooms/${roomId}/floor-dimensions`);
    expect(r.status).toBe(404);
  });

  it('GET /floor-dimensions returns 404 for unknown room', async () => {
    const r = await request(app).get('/api/v1/rooms/99999/floor-dimensions');
    expect(r.status).toBe(404);
  });

  it('DELETE room cascades surface_dimension', async () => {
    const cr = await request(app).post('/api/v1/rooms').send({ label: 'Cascade Room', floor: 'G' });
    const cRoomId = cr.body.id;
    await request(app).put(`/api/v1/rooms/${cRoomId}/floor-dimensions`).send({ width: 3, length: 3 });
    await request(app).delete(`/api/v1/rooms/${cRoomId}`);
    // Room deleted — dimension should also be gone (CASCADE)
    const r = await request(app).get(`/api/v1/rooms/${cRoomId}/floor-dimensions`);
    expect(r.status).toBe(404);
  });
});

// eslint-disable-next-line max-lines-per-function
describe('Ceiling Dimensions API', () => {
  it('GET returns 404 when not set', async () => {
    const r = await request(app).get(`/api/v1/rooms/${roomId}/ceiling-dimensions`);
    expect(r.status).toBe(404);
  });

  it('PUT creates ceiling dimension and returns 200', async () => {
    const start = Date.now();
    const r = await request(app)
      .put(`/api/v1/rooms/${roomId}/ceiling-dimensions`)
      .send({ width: 4.8, length: 3.0 });
    expect(Date.now() - start).toBeLessThan(2000);
    expect(r.status).toBe(200);
    expect(r.body.surfaceType).toBe('ceiling');
    expect(Number(r.body.width)).toBe(4.8);
  });

  it('PUT updates existing ceiling dimension and returns 200', async () => {
    const r = await request(app)
      .put(`/api/v1/rooms/${roomId}/ceiling-dimensions`)
      .send({ width: 5.0, length: 3.0 });
    expect(r.status).toBe(200);
    expect(Number(r.body.width)).toBe(5.0);
  });

  it('PUT returns 400 for invalid input', async () => {
    const r = await request(app)
      .put(`/api/v1/rooms/${roomId}/ceiling-dimensions`)
      .send({ width: -1, length: 3 });
    expect(r.status).toBe(400);
  });

  it('DELETE returns 204', async () => {
    const r = await request(app).delete(`/api/v1/rooms/${roomId}/ceiling-dimensions`);
    expect(r.status).toBe(204);
  });

  it('DELETE returns 404 when not set', async () => {
    const r = await request(app).delete(`/api/v1/rooms/${roomId}/ceiling-dimensions`);
    expect(r.status).toBe(404);
  });

  it('floor endpoint unaffected when ceiling is modified', async () => {
    await request(app).put(`/api/v1/rooms/${roomId}/floor-dimensions`).send({ width: 5, length: 4 });
    await request(app).put(`/api/v1/rooms/${roomId}/ceiling-dimensions`).send({ width: 3, length: 3 });
    await request(app).delete(`/api/v1/rooms/${roomId}/ceiling-dimensions`);
    const floorR = await request(app).get(`/api/v1/rooms/${roomId}/floor-dimensions`);
    expect(floorR.status).toBe(200);
    expect(floorR.body.surfaceType).toBe('floor');
  });
});

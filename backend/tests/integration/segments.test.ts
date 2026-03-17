import 'reflect-metadata';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb } from '../helpers/dbSetup';
import createApp from '../../src/app';
import { Application } from 'express';

let app: Application;
let dataSource: DataSource;
let roomId: number;

beforeAll(async () => {
  dataSource = await setupTestDb();
  app = createApp();
  const res = await request(app).post('/api/v1/rooms').send({ label: 'Test Room', floor: 'Ground' });
  roomId = res.body.id;
}, 30000);

afterAll(async () => {
  await teardownTestDb();
});

describe('Segments API', () => {
  describe('GET /api/v1/rooms/:roomId/segments?surface=floor', () => {
    it('returns empty array for new room', async () => {
      const start = Date.now();
      const res = await request(app).get(`/api/v1/rooms/${roomId}/segments?surface=floor`);
      expect(Date.now() - start).toBeLessThan(2000);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns 400 for missing surface param', async () => {
      const res = await request(app).get(`/api/v1/rooms/${roomId}/segments`);
      expect(res.status).toBe(400);
    });

    it('returns 400 for invalid surface param', async () => {
      const res = await request(app).get(`/api/v1/rooms/${roomId}/segments?surface=roof`);
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/v1/rooms/:roomId/segments', () => {
    it('creates floor segment', async () => {
      const start = Date.now();
      const res = await request(app)
        .post(`/api/v1/rooms/${roomId}/segments`)
        .send({ label: 'North Base', measurement: 4.5, surfaceType: 'floor' });
      expect(Date.now() - start).toBeLessThan(2000);
      expect(res.status).toBe(201);
      expect(res.body.surfaceType).toBe('floor');
      expect(Number(res.body.measurement)).toBe(4.5);
    });

    it('creates ceiling segment', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/${roomId}/segments`)
        .send({ label: 'Ceiling North', measurement: 3.2, surfaceType: 'ceiling' });
      expect(res.status).toBe(201);
      expect(res.body.surfaceType).toBe('ceiling');
    });

    it('returns 400 for zero measurement', async () => {
      const res = await request(app)
        .post(`/api/v1/rooms/${roomId}/segments`)
        .send({ label: 'X', measurement: 0, surfaceType: 'floor' });
      expect(res.status).toBe(400);
    });

    it('returns 404 for non-existent room', async () => {
      const res = await request(app)
        .post('/api/v1/rooms/99999/segments')
        .send({ label: 'X', measurement: 1, surfaceType: 'floor' });
      expect(res.status).toBe(404);
    });
  });

  describe('floor/ceiling independence', () => {
    it('floor and ceiling segments are independent', async () => {
      await request(app)
        .post(`/api/v1/rooms/${roomId}/segments`)
        .send({ label: 'F1', measurement: 2, surfaceType: 'floor' });
      await request(app)
        .post(`/api/v1/rooms/${roomId}/segments`)
        .send({ label: 'C1', measurement: 3, surfaceType: 'ceiling' });

      const floorRes = await request(app).get(`/api/v1/rooms/${roomId}/segments?surface=floor`);
      const ceilRes = await request(app).get(`/api/v1/rooms/${roomId}/segments?surface=ceiling`);

      expect(floorRes.body.every((s: { surfaceType: string }) => s.surfaceType === 'floor')).toBe(true);
      expect(ceilRes.body.every((s: { surfaceType: string }) => s.surfaceType === 'ceiling')).toBe(true);
    });
  });

  describe('PATCH /api/v1/rooms/:roomId/segments/:segmentId', () => {
    it('updates segment label', async () => {
      const createRes = await request(app)
        .post(`/api/v1/rooms/${roomId}/segments`)
        .send({ label: 'Original', measurement: 5, surfaceType: 'floor' });
      const segId = createRes.body.id;
      const start = Date.now();
      const res = await request(app)
        .patch(`/api/v1/rooms/${roomId}/segments/${segId}`)
        .send({ label: 'Updated' });
      expect(Date.now() - start).toBeLessThan(2000);
      expect(res.status).toBe(200);
      expect(res.body.label).toBe('Updated');
    });

    it('returns 404 for non-existent segment', async () => {
      const res = await request(app)
        .patch(`/api/v1/rooms/${roomId}/segments/99999`)
        .send({ label: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/rooms/:roomId/segments/:segmentId', () => {
    it('deletes segment and returns 204', async () => {
      const createRes = await request(app)
        .post(`/api/v1/rooms/${roomId}/segments`)
        .send({ label: 'ToDelete', measurement: 1, surfaceType: 'floor' });
      const segId = createRes.body.id;
      const res = await request(app).delete(`/api/v1/rooms/${roomId}/segments/${segId}`);
      expect(res.status).toBe(204);
    });

    it('returns 404 for non-existent segment', async () => {
      const res = await request(app).delete(`/api/v1/rooms/${roomId}/segments/99999`);
      expect(res.status).toBe(404);
    });
  });
});

import 'reflect-metadata';
import request from 'supertest';
import { DataSource } from 'typeorm';
import { setupTestDb, teardownTestDb, getTestDataSource } from '../helpers/dbSetup';
import createApp from '../../src/app';
import { Application } from 'express';

let app: Application;
let dataSource: DataSource;

beforeAll(async () => {
  dataSource = await setupTestDb();
  app = createApp();
}, 30000);

afterAll(async () => {
  await teardownTestDb();
});

describe('Rooms API', () => {
  describe('GET /api/v1/rooms', () => {
    it('returns empty array when no rooms', async () => {
      const start = Date.now();
      const res = await request(app).get('/api/v1/rooms');
      expect(Date.now() - start).toBeLessThan(2000);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });

    it('returns rooms ordered by floor then createdAt', async () => {
      await dataSource.query(
        "INSERT INTO room (label, floor) VALUES ('Living Room', 'First Floor'), ('Kitchen', 'Ground Floor')"
      );
      const res = await request(app).get('/api/v1/rooms');
      expect(res.status).toBe(200);
      expect(res.body[0].floor).toBe('First Floor');
      expect(res.body[1].floor).toBe('Ground Floor');
    });
  });

  describe('POST /api/v1/rooms', () => {
    it('creates a room and returns 201', async () => {
      const start = Date.now();
      const res = await request(app)
        .post('/api/v1/rooms')
        .send({ label: 'Kitchen', floor: 'Ground Floor' });
      expect(Date.now() - start).toBeLessThan(2000);
      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.label).toBe('Kitchen');
    });

    it('returns 400 when label is missing', async () => {
      const res = await request(app).post('/api/v1/rooms').send({ floor: 'Ground Floor' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('returns 400 when floor is missing', async () => {
      const res = await request(app).post('/api/v1/rooms').send({ label: 'Kitchen' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/v1/rooms/:roomId', () => {
    it('returns room detail with empty arrays for new room', async () => {
      const createRes = await request(app)
        .post('/api/v1/rooms')
        .send({ label: 'Study', floor: 'First Floor' });
      const roomId = createRes.body.id;
      const res = await request(app).get(`/api/v1/rooms/${roomId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(roomId);
      expect(res.body.floorSegments).toEqual([]);
      expect(res.body.ceilingSegments).toEqual([]);
      expect(res.body.walls).toEqual([]);
    });

    it('returns 404 for non-existent room', async () => {
      const res = await request(app).get('/api/v1/rooms/99999');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/v1/rooms/:roomId', () => {
    it('updates room label', async () => {
      const createRes = await request(app)
        .post('/api/v1/rooms')
        .send({ label: 'Old Name', floor: 'Ground Floor' });
      const roomId = createRes.body.id;
      const start = Date.now();
      const res = await request(app)
        .patch(`/api/v1/rooms/${roomId}`)
        .send({ label: 'New Name' });
      expect(Date.now() - start).toBeLessThan(2000);
      expect(res.status).toBe(200);
      expect(res.body.label).toBe('New Name');
    });

    it('returns 404 for non-existent room', async () => {
      const res = await request(app).patch('/api/v1/rooms/99999').send({ label: 'X' });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/v1/rooms/:roomId', () => {
    it('deletes room and returns 204', async () => {
      const createRes = await request(app)
        .post('/api/v1/rooms')
        .send({ label: 'To Delete', floor: 'Ground Floor' });
      const roomId = createRes.body.id;
      const res = await request(app).delete(`/api/v1/rooms/${roomId}`);
      expect(res.status).toBe(204);
      const getRes = await request(app).get(`/api/v1/rooms/${roomId}`);
      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent room', async () => {
      const res = await request(app).delete('/api/v1/rooms/99999');
      expect(res.status).toBe(404);
    });
  });
});

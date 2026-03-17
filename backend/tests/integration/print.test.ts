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

describe('GET /api/v1/rooms/summary', () => {
  it('returns empty floors when no rooms', async () => {
    const r = await request(app).get('/api/v1/rooms/summary');
    expect(r.status).toBe(200);
    expect(r.body.floors).toEqual([]);
    expect(r.body.unit).toBeDefined();
  });

  it('groups rooms by floor alphabetically', async () => {
    await request(app).post('/api/v1/rooms').send({ label: 'R1', floor: 'Ground Floor' });
    await request(app).post('/api/v1/rooms').send({ label: 'R2', floor: 'First Floor' });
    const r = await request(app).get('/api/v1/rooms/summary');
    expect(r.status).toBe(200);
    expect(r.body.floors[0].floor).toBe('First Floor');
    expect(r.body.floors[1].floor).toBe('Ground Floor');
  });

  it('includes nested data in summary', async () => {
    const roomRes = await request(app).post('/api/v1/rooms').send({ label: 'Full', floor: 'Attic' });
    const rId = roomRes.body.id;
    await request(app).post(`/api/v1/rooms/${rId}/segments`).send({ label: 'FS', measurement: 3, surfaceType: 'floor' });
    const wallRes = await request(app).post(`/api/v1/rooms/${rId}/walls`).send({ label: 'W', width: 5, height: 2 });
    await request(app).post(`/api/v1/rooms/${rId}/walls/${wallRes.body.id}/windows`).send({ label: 'Win', width: 1, height: 1 });
    const r = await request(app).get('/api/v1/rooms/summary');
    const attic = r.body.floors.find((f: { floor: string }) => f.floor === 'Attic');
    expect(attic.rooms[0].floorSegments).toHaveLength(1);
    expect(attic.rooms[0].walls[0].windows).toHaveLength(1);
  });

  it('includes current unit in response', async () => {
    const r = await request(app).get('/api/v1/rooms/summary');
    expect(['m', 'cm', 'ft', 'in']).toContain(r.body.unit);
  });
});

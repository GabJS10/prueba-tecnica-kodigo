import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock del cliente Prisma para no depender de una base de datos real.
const queryRaw = vi.fn();
vi.mock('../src/db.js', () => ({
  prisma: {
    $queryRaw: (...args: unknown[]) => queryRaw(...args),
  },
}));

const { createApp } = await import('../src/app.js');
const app = createApp();

describe('GET /health', () => {
  beforeEach(() => queryRaw.mockReset());

  it('responde 200 cuando la base de datos está operativa', async () => {
    queryRaw.mockResolvedValueOnce([{ '?column?': 1 }]);
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'up' });
  });

  it('responde 503 cuando la base de datos falla', async () => {
    queryRaw.mockRejectedValueOnce(new Error('connection refused'));
    const res = await request(app).get('/health');
    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'error', database: 'down' });
  });
});

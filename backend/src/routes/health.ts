import { Router } from 'express';
import { prisma } from '../db.js';

export const healthRouter = Router();

/**
 * GET /health
 * Responde 200 solo si la app y su conexión a la base de datos están operativas.
 * Si la consulta a la DB falla, responde 503.
 */
healthRouter.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'up' });
  } catch {
    res.status(503).json({ status: 'error', database: 'down' });
  }
});

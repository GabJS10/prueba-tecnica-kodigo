import express from 'express';
import cors from 'cors';
import { healthRouter } from './routes/health.js';
import { promotionsRouter } from './routes/promotions.js';
import { catalogRouter } from './routes/catalog.js';

/**
 * Construye la app Express. Se exporta aparte de index.ts para poder
 * instanciarla en los tests sin abrir un puerto.
 */
export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(healthRouter);
  app.use('/api/promotions', promotionsRouter);
  app.use('/api', catalogRouter);

  return app;
}

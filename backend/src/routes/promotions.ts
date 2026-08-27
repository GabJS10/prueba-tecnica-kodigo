import { Router } from 'express';
import { ZodError } from 'zod';
import {
  createPromotionSchema,
  updateStatusSchema,
} from '../validation/promotionSchema.js';
import {
  changeStatus,
  createPromotion,
  deletePromotion,
  getSummary,
  listPromotions,
} from '../services/promotionService.js';
import { DomainError } from '../services/errors.js';

export const promotionsRouter = Router();

/** Traduce un error a respuesta HTTP (Zod → 422, DomainError → su código). */
function handleError(err: unknown, res: import('express').Response) {
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Datos inválidos',
      details: err.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
    });
  }
  if (err instanceof DomainError) {
    return res.status(err.statusCode).json({ error: err.message });
  }
  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
}

// GET /api/promotions/summary  (antes de :id para no colisionar)
promotionsRouter.get('/summary', async (_req, res) => {
  try {
    res.json(await getSummary());
  } catch (err) {
    handleError(err, res);
  }
});

// GET /api/promotions
promotionsRouter.get('/', async (_req, res) => {
  try {
    res.json(await listPromotions());
  } catch (err) {
    handleError(err, res);
  }
});

// POST /api/promotions
promotionsRouter.post('/', async (req, res) => {
  try {
    const input = createPromotionSchema.parse(req.body);
    const promo = await createPromotion(input);
    res.status(201).json(promo);
  } catch (err) {
    handleError(err, res);
  }
});

// PATCH /api/promotions/:id/status
promotionsRouter.patch('/:id/status', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = updateStatusSchema.parse(req.body);
    const promo = await changeStatus(id, status);
    res.json(promo);
  } catch (err) {
    handleError(err, res);
  }
});

// DELETE /api/promotions/:id
promotionsRouter.delete('/:id', async (req, res) => {
  try {
    await deletePromotion(Number(req.params.id));
    res.status(204).send();
  } catch (err) {
    handleError(err, res);
  }
});

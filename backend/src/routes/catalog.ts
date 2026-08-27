import { Router } from 'express';
import { prisma } from '../db.js';

/** Catálogo de apoyo para el formulario: productos y categorías disponibles. */
export const catalogRouter = Router();

catalogRouter.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany({ orderBy: { name: 'asc' } });
  res.json(products);
});

catalogRouter.get('/categories', async (_req, res) => {
  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  res.json(categories);
});

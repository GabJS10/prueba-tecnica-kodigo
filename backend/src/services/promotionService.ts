import { Prisma, PromotionStatus } from '@prisma/client';
import { prisma } from '../db.js';
import type { CreatePromotionInput } from '../validation/promotionSchema.js';
import { canTransition, isDeletable, isEditable } from '../domain/status.js';
import { ConflictError, NotFoundError } from './errors.js';

/** Crea una promoción en estado inicial PROGRAMADA. */
export async function createPromotion(input: CreatePromotionInput) {
  return prisma.promotion.create({
    data: {
      name: input.name,
      discountType: input.discountType,
      discountValue: new Prisma.Decimal(input.discountValue),
      startDate: input.startDate,
      endDate: input.endDate,
      status: PromotionStatus.PROGRAMADA,
      productId: input.productId ?? null,
      categoryId: input.categoryId ?? null,
    },
    include: { product: true, category: true },
  });
}

/** Lista todas las promociones con su producto/categoría asociados. */
export async function listPromotions() {
  return prisma.promotion.findMany({
    orderBy: { createdAt: 'desc' },
    include: { product: true, category: true },
  });
}

async function getOrThrow(id: number) {
  const promo = await prisma.promotion.findUnique({ where: { id } });
  if (!promo) throw new NotFoundError(`Promoción ${id} no encontrada`);
  return promo;
}

/**
 * Cambia el estado de una promoción respetando la máquina de estados.
 * - Una promoción FINALIZADA no puede modificarse.
 * - Solo se permiten transiciones válidas (PROGRAMADA→ACTIVA→FINALIZADA).
 */
export async function changeStatus(id: number, target: PromotionStatus) {
  const promo = await getOrThrow(id);

  if (!isEditable(promo.status)) {
    throw new ConflictError('Una promoción FINALIZADA no puede modificarse');
  }
  if (!canTransition(promo.status, target)) {
    throw new ConflictError(
      `Transición no permitida: ${promo.status} → ${target}`
    );
  }

  return prisma.promotion.update({
    where: { id },
    data: { status: target },
    include: { product: true, category: true },
  });
}

/** Elimina una promoción (solo si está en estado PROGRAMADA). */
export async function deletePromotion(id: number) {
  const promo = await getOrThrow(id);

  if (!isDeletable(promo.status)) {
    throw new ConflictError(
      'Solo se pueden eliminar promociones en estado PROGRAMADA'
    );
  }

  await prisma.promotion.delete({ where: { id } });
}

/**
 * Resumen: contador por estado + número de promociones vigentes hoy
 * (fecha actual dentro del rango [start_date, end_date]).
 */
export async function getSummary() {
  const grouped = await prisma.promotion.groupBy({
    by: ['status'],
    _count: { _all: true },
  });

  const byStatus: Record<PromotionStatus, number> = {
    PROGRAMADA: 0,
    ACTIVA: 0,
    FINALIZADA: 0,
  };
  for (const row of grouped) {
    byStatus[row.status] = row._count._all;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const activeToday = await prisma.promotion.count({
    where: {
      startDate: { lte: today },
      endDate: { gte: today },
    },
  });

  return { byStatus, activeToday };
}

import { z } from 'zod';
import { DiscountType, PromotionStatus } from '@prisma/client';

/**
 * Esquema de validación para crear una promoción.
 * Reglas del spec:
 *  - name, valor de descuento y (producto O categoría) son requeridos.
 *  - end_date debe ser posterior a start_date.
 *  - Si el tipo es PERCENTAGE, el valor debe estar entre 1 y 100.
 */
export const createPromotionSchema = z
  .object({
    name: z.string().trim().min(1, 'El nombre es obligatorio'),
    discountType: z.nativeEnum(DiscountType, {
      errorMap: () => ({ message: 'Tipo de descuento inválido (PERCENTAGE | FIXED)' }),
    }),
    discountValue: z.coerce
      .number({ invalid_type_error: 'El valor de descuento es obligatorio' })
      .positive('El valor de descuento debe ser mayor que 0'),
    startDate: z.coerce.date({ invalid_type_error: 'Fecha de inicio inválida' }),
    endDate: z.coerce.date({ invalid_type_error: 'Fecha de fin inválida' }),
    productId: z.coerce.number().int().positive().optional().nullable(),
    categoryId: z.coerce.number().int().positive().optional().nullable(),
  })
  .refine((d) => d.endDate > d.startDate, {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  })
  .refine(
    (d) =>
      d.discountType !== DiscountType.PERCENTAGE ||
      (d.discountValue >= 1 && d.discountValue <= 100),
    {
      message: 'Un descuento de tipo porcentaje debe estar entre 1 y 100',
      path: ['discountValue'],
    }
  )
  .refine((d) => (d.productId == null) !== (d.categoryId == null), {
    message: 'Debe asociarse exactamente un producto O una categoría (no ambos)',
    path: ['productId'],
  });

export type CreatePromotionInput = z.infer<typeof createPromotionSchema>;

/** Esquema para cambiar el estado de una promoción. */
export const updateStatusSchema = z.object({
  status: z.nativeEnum(PromotionStatus, {
    errorMap: () => ({ message: 'Estado inválido (PROGRAMADA | ACTIVA | FINALIZADA)' }),
  }),
});

export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;

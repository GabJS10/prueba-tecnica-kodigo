import { describe, it, expect } from 'vitest';
import { createPromotionSchema } from '../src/validation/promotionSchema.js';

/** Payload válido base; cada test sobreescribe lo que necesita. */
function validBase(overrides: Record<string, unknown> = {}) {
  return {
    name: 'Promo verano',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    startDate: '2026-08-01',
    endDate: '2026-12-31',
    productId: 1,
    ...overrides,
  };
}

describe('createPromotionSchema', () => {
  it('acepta un payload válido con producto', () => {
    const result = createPromotionSchema.safeParse(validBase());
    expect(result.success).toBe(true);
  });

  it('acepta un payload válido con categoría', () => {
    const result = createPromotionSchema.safeParse(
      validBase({ productId: undefined, categoryId: 3 })
    );
    expect(result.success).toBe(true);
  });

  describe('campos requeridos', () => {
    it('rechaza sin nombre', () => {
      const r = createPromotionSchema.safeParse(validBase({ name: '' }));
      expect(r.success).toBe(false);
    });

    it('rechaza sin valor de descuento', () => {
      const r = createPromotionSchema.safeParse(validBase({ discountValue: undefined }));
      expect(r.success).toBe(false);
    });
  });

  describe('producto XOR categoría', () => {
    it('rechaza si no hay ni producto ni categoría', () => {
      const r = createPromotionSchema.safeParse(
        validBase({ productId: undefined, categoryId: undefined })
      );
      expect(r.success).toBe(false);
    });

    it('rechaza si hay producto Y categoría', () => {
      const r = createPromotionSchema.safeParse(
        validBase({ productId: 1, categoryId: 2 })
      );
      expect(r.success).toBe(false);
    });
  });

  describe('rango de fechas', () => {
    it('rechaza si endDate <= startDate', () => {
      const r = createPromotionSchema.safeParse(
        validBase({ startDate: '2026-12-31', endDate: '2026-01-01' })
      );
      expect(r.success).toBe(false);
    });
  });

  describe('porcentaje entre 1 y 100', () => {
    it('rechaza porcentaje > 100', () => {
      const r = createPromotionSchema.safeParse(validBase({ discountValue: 150 }));
      expect(r.success).toBe(false);
    });

    it('rechaza porcentaje < 1', () => {
      const r = createPromotionSchema.safeParse(validBase({ discountValue: 0.5 }));
      expect(r.success).toBe(false);
    });

    it('acepta porcentaje en el límite (100)', () => {
      const r = createPromotionSchema.safeParse(validBase({ discountValue: 100 }));
      expect(r.success).toBe(true);
    });

    it('permite montos > 100 cuando el tipo es FIXED', () => {
      const r = createPromotionSchema.safeParse(
        validBase({ discountType: 'FIXED', discountValue: 500 })
      );
      expect(r.success).toBe(true);
    });
  });
});

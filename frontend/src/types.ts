export type DiscountType = 'PERCENTAGE' | 'FIXED';
export type PromotionStatus = 'PROGRAMADA' | 'ACTIVA' | 'FINALIZADA';

export interface NamedEntity {
  id: number;
  name: string;
}

export interface Promotion {
  id: number;
  name: string;
  discountType: DiscountType;
  discountValue: string; // Decimal serializado como string por Prisma
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  productId: number | null;
  categoryId: number | null;
  product: NamedEntity | null;
  category: NamedEntity | null;
}

export interface Summary {
  byStatus: Record<PromotionStatus, number>;
  activeToday: number;
}

export interface CreatePromotionPayload {
  name: string;
  discountType: DiscountType;
  discountValue: number;
  startDate: string;
  endDate: string;
  productId?: number | null;
  categoryId?: number | null;
}

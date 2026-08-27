import type {
  CreatePromotionPayload,
  NamedEntity,
  Promotion,
  PromotionStatus,
  Summary,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

/** Wrapper de fetch que lanza el mensaje de error del backend si lo hay. */
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (res.status === 204) return undefined as T;

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      body?.error ??
      body?.details?.map((d: { message: string }) => d.message).join(', ') ??
      `Error ${res.status}`;
    throw new Error(message);
  }
  return body as T;
}

export const api = {
  listPromotions: () => request<Promotion[]>('/api/promotions'),
  getSummary: () => request<Summary>('/api/promotions/summary'),
  createPromotion: (payload: CreatePromotionPayload) =>
    request<Promotion>('/api/promotions', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  changeStatus: (id: number, status: PromotionStatus) =>
    request<Promotion>(`/api/promotions/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
  deletePromotion: (id: number) =>
    request<void>(`/api/promotions/${id}`, { method: 'DELETE' }),
  listProducts: () => request<NamedEntity[]>('/api/products'),
  listCategories: () => request<NamedEntity[]>('/api/categories'),
};

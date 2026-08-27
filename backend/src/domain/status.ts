import { PromotionStatus } from '@prisma/client';

/**
 * Máquina de estados de una promoción.
 * Flujo permitido: PROGRAMADA → ACTIVA → FINALIZADA (solo hacia adelante).
 */
const ALLOWED_TRANSITIONS: Record<PromotionStatus, PromotionStatus[]> = {
  [PromotionStatus.PROGRAMADA]: [PromotionStatus.ACTIVA],
  [PromotionStatus.ACTIVA]: [PromotionStatus.FINALIZADA],
  [PromotionStatus.FINALIZADA]: [],
};

/** Indica si se puede pasar de `from` a `to`. */
export function canTransition(from: PromotionStatus, to: PromotionStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

/** Devuelve el siguiente estado natural, o null si ya es terminal. */
export function nextStatus(from: PromotionStatus): PromotionStatus | null {
  return ALLOWED_TRANSITIONS[from][0] ?? null;
}

/** Una promoción FINALIZADA no puede modificarse. */
export function isEditable(status: PromotionStatus): boolean {
  return status !== PromotionStatus.FINALIZADA;
}

/** Solo se puede eliminar una promoción en estado PROGRAMADA. */
export function isDeletable(status: PromotionStatus): boolean {
  return status === PromotionStatus.PROGRAMADA;
}

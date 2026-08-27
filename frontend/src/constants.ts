import type { PromotionStatus } from './types';

/** Siguiente estado natural en el flujo PROGRAMADA→ACTIVA→FINALIZADA. */
export const NEXT_STATUS: Record<PromotionStatus, PromotionStatus | null> = {
  PROGRAMADA: 'ACTIVA',
  ACTIVA: 'FINALIZADA',
  FINALIZADA: null,
};

export const STATUS_LABEL: Record<PromotionStatus, string> = {
  PROGRAMADA: 'Programada',
  ACTIVA: 'Activa',
  FINALIZADA: 'Finalizada',
};

/** Etiqueta del botón que avanza al siguiente estado. */
export const ADVANCE_LABEL: Record<PromotionStatus, string> = {
  PROGRAMADA: 'Activar',
  ACTIVA: 'Finalizar',
  FINALIZADA: '',
};

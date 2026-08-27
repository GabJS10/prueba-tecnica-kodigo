import { describe, it, expect } from 'vitest';
import { PromotionStatus } from '@prisma/client';
import {
  canTransition,
  nextStatus,
  isEditable,
  isDeletable,
} from '../src/domain/status.js';

const { PROGRAMADA, ACTIVA, FINALIZADA } = PromotionStatus;

describe('máquina de estados', () => {
  describe('canTransition', () => {
    it('permite las transiciones válidas hacia adelante', () => {
      expect(canTransition(PROGRAMADA, ACTIVA)).toBe(true);
      expect(canTransition(ACTIVA, FINALIZADA)).toBe(true);
    });

    it('rechaza retrocesos', () => {
      expect(canTransition(ACTIVA, PROGRAMADA)).toBe(false);
      expect(canTransition(FINALIZADA, ACTIVA)).toBe(false);
      expect(canTransition(FINALIZADA, PROGRAMADA)).toBe(false);
    });

    it('rechaza saltos de estado', () => {
      expect(canTransition(PROGRAMADA, FINALIZADA)).toBe(false);
    });

    it('rechaza transición al mismo estado', () => {
      expect(canTransition(ACTIVA, ACTIVA)).toBe(false);
    });
  });

  describe('nextStatus', () => {
    it('devuelve el siguiente estado natural', () => {
      expect(nextStatus(PROGRAMADA)).toBe(ACTIVA);
      expect(nextStatus(ACTIVA)).toBe(FINALIZADA);
    });

    it('devuelve null en estado terminal', () => {
      expect(nextStatus(FINALIZADA)).toBeNull();
    });
  });

  describe('isEditable', () => {
    it('FINALIZADA no es editable', () => {
      expect(isEditable(FINALIZADA)).toBe(false);
    });
    it('PROGRAMADA y ACTIVA son editables', () => {
      expect(isEditable(PROGRAMADA)).toBe(true);
      expect(isEditable(ACTIVA)).toBe(true);
    });
  });

  describe('isDeletable', () => {
    it('solo PROGRAMADA es eliminable', () => {
      expect(isDeletable(PROGRAMADA)).toBe(true);
      expect(isDeletable(ACTIVA)).toBe(false);
      expect(isDeletable(FINALIZADA)).toBe(false);
    });
  });
});

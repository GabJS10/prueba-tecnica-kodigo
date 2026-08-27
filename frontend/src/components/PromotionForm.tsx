import { useState } from 'react';
import type {
  CreatePromotionPayload,
  DiscountType,
  NamedEntity,
} from '../types';

interface Props {
  products: NamedEntity[];
  categories: NamedEntity[];
  onCreate: (payload: CreatePromotionPayload) => Promise<void>;
}

type TargetKind = 'product' | 'category';

const EMPTY = {
  name: '',
  discountType: 'PERCENTAGE' as DiscountType,
  discountValue: '',
  startDate: '',
  endDate: '',
  targetKind: 'product' as TargetKind,
  targetId: '',
};

/** Valida en cliente las mismas reglas que el backend. Devuelve error o null. */
function validate(f: typeof EMPTY): string | null {
  if (!f.name.trim()) return 'El nombre es obligatorio.';
  if (!f.targetId) return 'Selecciona un producto o categoría.';
  const value = Number(f.discountValue);
  if (!f.discountValue || Number.isNaN(value) || value <= 0)
    return 'El valor de descuento debe ser mayor que 0.';
  if (f.discountType === 'PERCENTAGE' && (value < 1 || value > 100))
    return 'El porcentaje debe estar entre 1 y 100.';
  if (!f.startDate || !f.endDate) return 'Indica las fechas de inicio y fin.';
  if (new Date(f.endDate) <= new Date(f.startDate))
    return 'La fecha de fin debe ser posterior a la de inicio.';
  return null;
}

export function PromotionForm({ products, categories, onCreate }: Props) {
  const [f, setF] = useState({ ...EMPTY });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (patch: Partial<typeof EMPTY>) => setF((prev) => ({ ...prev, ...patch }));

  const options = f.targetKind === 'product' ? products : categories;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const validationError = validate(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await onCreate({
        name: f.name.trim(),
        discountType: f.discountType,
        discountValue: Number(f.discountValue),
        startDate: f.startDate,
        endDate: f.endDate,
        productId: f.targetKind === 'product' ? Number(f.targetId) : null,
        categoryId: f.targetKind === 'category' ? Number(f.targetId) : null,
      });
      setF({ ...EMPTY });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la promoción.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="promo-form" onSubmit={handleSubmit}>
      <h2>Nueva promoción</h2>

      <label>
        Nombre
        <input
          type="text"
          value={f.name}
          onChange={(e) => set({ name: e.target.value })}
          placeholder="Ej. Descuento de verano"
        />
      </label>

      <div className="row">
        <label>
          Asociar a
          <select
            value={f.targetKind}
            onChange={(e) => set({ targetKind: e.target.value as TargetKind, targetId: '' })}
          >
            <option value="product">Producto</option>
            <option value="category">Categoría</option>
          </select>
        </label>
        <label>
          {f.targetKind === 'product' ? 'Producto' : 'Categoría'}
          <select value={f.targetId} onChange={(e) => set({ targetId: e.target.value })}>
            <option value="">— Selecciona —</option>
            {options.map((o) => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="row">
        <label>
          Tipo de descuento
          <select
            value={f.discountType}
            onChange={(e) => set({ discountType: e.target.value as DiscountType })}
          >
            <option value="PERCENTAGE">Porcentaje (%)</option>
            <option value="FIXED">Monto fijo ($)</option>
          </select>
        </label>
        <label>
          Valor
          <input
            type="number"
            step="0.01"
            min="0"
            value={f.discountValue}
            onChange={(e) => set({ discountValue: e.target.value })}
          />
        </label>
      </div>

      <div className="row">
        <label>
          Fecha inicio
          <input
            type="date"
            value={f.startDate}
            onChange={(e) => set({ startDate: e.target.value })}
          />
        </label>
        <label>
          Fecha fin
          <input
            type="date"
            value={f.endDate}
            onChange={(e) => set({ endDate: e.target.value })}
          />
        </label>
      </div>

      {error && <p className="form-error">{error}</p>}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? 'Guardando…' : 'Crear promoción'}
      </button>
    </form>
  );
}

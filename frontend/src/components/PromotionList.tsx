import type { Promotion } from '../types';
import { ADVANCE_LABEL, NEXT_STATUS, STATUS_LABEL } from '../constants';

interface Props {
  promotions: Promotion[];
  onAdvance: (p: Promotion) => void;
  onDelete: (p: Promotion) => void;
}

function formatDiscount(p: Promotion) {
  return p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `$${p.discountValue}`;
}

function formatTarget(p: Promotion) {
  if (p.product) return `Producto: ${p.product.name}`;
  if (p.category) return `Categoría: ${p.category.name}`;
  return '—';
}

export function PromotionList({ promotions, onAdvance, onDelete }: Props) {
  if (promotions.length === 0) {
    return <p className="empty">No hay promociones todavía.</p>;
  }

  return (
    <div className="table-wrapper">
      <table className="promo-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Asociado a</th>
            <th>Descuento</th>
            <th>Vigencia</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((p) => {
            const next = NEXT_STATUS[p.status];
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{formatTarget(p)}</td>
                <td>{formatDiscount(p)}</td>
                <td>
                  {p.startDate.slice(0, 10)} → {p.endDate.slice(0, 10)}
                </td>
                <td>
                  <span className={`badge status-${p.status.toLowerCase()}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td className="actions">
                  {next && (
                    <button className="btn-advance" onClick={() => onAdvance(p)}>
                      {ADVANCE_LABEL[p.status]}
                    </button>
                  )}
                  {p.status === 'PROGRAMADA' && (
                    <button className="btn-delete" onClick={() => onDelete(p)}>
                      Eliminar
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

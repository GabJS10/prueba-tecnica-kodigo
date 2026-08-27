import type { Promotion } from '../types';
import { ADVANCE_LABEL, NEXT_STATUS, STATUS_LABEL } from '../constants';
import { ArrowRightIcon, TrashIcon, TagIcon } from './icons';

interface Props {
  promotions: Promotion[];
  onAdvance: (p: Promotion) => void;
  onDelete: (p: Promotion) => void;
}

function formatDiscount(p: Promotion) {
  return p.discountType === 'PERCENTAGE' ? `${p.discountValue}%` : `$${p.discountValue}`;
}

function formatTarget(p: Promotion) {
  if (p.product) return p.product.name;
  if (p.category) return p.category.name;
  return '—';
}

export function PromotionList({ promotions, onAdvance, onDelete }: Props) {
  if (promotions.length === 0) {
    return (
      <div className="empty">
        <TagIcon size={34} className="empty-icon" />
        <p>Aún no hay promociones. Crea la primera con el formulario.</p>
      </div>
    );
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
                <td className="promo-name">{p.name}</td>
                <td className="promo-target">{formatTarget(p)}</td>
                <td className="promo-discount">{formatDiscount(p)}</td>
                <td className="promo-dates">
                  {p.startDate.slice(0, 10)} → {p.endDate.slice(0, 10)}
                </td>
                <td>
                  <span className={`badge status-${p.status.toLowerCase()}`}>
                    {STATUS_LABEL[p.status]}
                  </span>
                </td>
                <td>
                  <div className="actions">
                    {next && (
                      <button
                        className="btn-action btn-advance"
                        onClick={() => onAdvance(p)}
                        title={`Pasar a ${STATUS_LABEL[next]}`}
                      >
                        {ADVANCE_LABEL[p.status]}
                        <ArrowRightIcon size={14} />
                      </button>
                    )}
                    {p.status === 'PROGRAMADA' && (
                      <button
                        className="btn-action btn-danger"
                        onClick={() => onDelete(p)}
                        title="Eliminar"
                      >
                        <TrashIcon size={14} />
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

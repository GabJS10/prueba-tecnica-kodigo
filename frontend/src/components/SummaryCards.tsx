import type { Summary } from '../types';
import { STATUS_LABEL } from '../constants';

interface Props {
  summary: Summary | null;
}

export function SummaryCards({ summary }: Props) {
  if (!summary) return null;

  const cards = [
    { key: 'PROGRAMADA', label: STATUS_LABEL.PROGRAMADA, value: summary.byStatus.PROGRAMADA },
    { key: 'ACTIVA', label: STATUS_LABEL.ACTIVA, value: summary.byStatus.ACTIVA },
    { key: 'FINALIZADA', label: STATUS_LABEL.FINALIZADA, value: summary.byStatus.FINALIZADA },
    { key: 'VIGENTES', label: 'Vigentes hoy', value: summary.activeToday },
  ];

  return (
    <section className="summary">
      {cards.map((c) => (
        <div key={c.key} className={`summary-card status-${c.key.toLowerCase()}`}>
          <span className="summary-value">{c.value}</span>
          <span className="summary-label">{c.label}</span>
        </div>
      ))}
    </section>
  );
}

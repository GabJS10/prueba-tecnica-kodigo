import type { JSX } from 'react';
import type { Summary } from '../types';
import { STATUS_LABEL } from '../constants';
import { CalendarIcon, BoltIcon, CheckCircleIcon, ArchiveIcon } from './icons';

interface Props {
  summary: Summary | null;
}

interface Card {
  key: string;
  label: string;
  value: number;
  icon: JSX.Element;
}

export function SummaryCards({ summary }: Props) {
  if (!summary) return null;

  const cards: Card[] = [
    {
      key: 'programada',
      label: STATUS_LABEL.PROGRAMADA,
      value: summary.byStatus.PROGRAMADA,
      icon: <CalendarIcon />,
    },
    {
      key: 'activa',
      label: STATUS_LABEL.ACTIVA,
      value: summary.byStatus.ACTIVA,
      icon: <BoltIcon />,
    },
    {
      key: 'finalizada',
      label: STATUS_LABEL.FINALIZADA,
      value: summary.byStatus.FINALIZADA,
      icon: <ArchiveIcon />,
    },
    {
      key: 'vigentes',
      label: 'Vigentes hoy',
      value: summary.activeToday,
      icon: <CheckCircleIcon />,
    },
  ];

  return (
    <section className="summary">
      {cards.map((c) => (
        <div key={c.key} className={`summary-card status-${c.key}`}>
          <span className="summary-icon">{c.icon}</span>
          <span className="summary-text">
            <span className="summary-value">{c.value}</span>
            <span className="summary-label">{c.label}</span>
          </span>
        </div>
      ))}
    </section>
  );
}

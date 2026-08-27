import { useCallback, useEffect, useState } from 'react';
import { api } from './api/client';
import type { CreatePromotionPayload, NamedEntity, Promotion, Summary } from './types';
import { SummaryCards } from './components/SummaryCards';
import { PromotionForm } from './components/PromotionForm';
import { PromotionList } from './components/PromotionList';
import { NEXT_STATUS } from './constants';

export function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<NamedEntity[]>([]);
  const [categories, setCategories] = useState<NamedEntity[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [promos, sum] = await Promise.all([api.listPromotions(), api.getSummary()]);
      setPromotions(promos);
      setSummary(sum);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la información.');
    }
  }, []);

  useEffect(() => {
    void refresh();
    void api.listProducts().then(setProducts).catch(() => {});
    void api.listCategories().then(setCategories).catch(() => {});
  }, [refresh]);

  const handleCreate = async (payload: CreatePromotionPayload) => {
    await api.createPromotion(payload);
    await refresh();
  };

  const handleAdvance = async (p: Promotion) => {
    const next = NEXT_STATUS[p.status];
    if (!next) return;
    try {
      await api.changeStatus(p.id, next);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el estado.');
    }
  };

  const handleDelete = async (p: Promotion) => {
    if (!confirm(`¿Eliminar la promoción "${p.name}"?`)) return;
    try {
      await api.deletePromotion(p.id);
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
    }
  };

  return (
    <main className="container">
      <header>
        <h1>Gestión de Promociones</h1>
      </header>

      {error && <p className="banner-error">{error}</p>}

      <SummaryCards summary={summary} />

      <div className="layout">
        <PromotionForm products={products} categories={categories} onCreate={handleCreate} />
        <section className="list-section">
          <h2>Promociones</h2>
          <PromotionList
            promotions={promotions}
            onAdvance={handleAdvance}
            onDelete={handleDelete}
          />
        </section>
      </div>
    </main>
  );
}

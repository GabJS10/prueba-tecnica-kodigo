import { useCallback, useEffect, useState } from 'react';
import { api } from './api/client';
import type { CreatePromotionPayload, NamedEntity, Promotion, Summary } from './types';
import { SummaryCards } from './components/SummaryCards';
import { PromotionForm } from './components/PromotionForm';
import { PromotionList } from './components/PromotionList';
import { NEXT_STATUS } from './constants';
import { TagIcon } from './components/icons';

export function App() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [products, setProducts] = useState<NamedEntity[]>([]);
  const [categories, setCategories] = useState<NamedEntity[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const [promos, sum] = await Promise.all([api.listPromotions(), api.getSummary()]);
      setPromotions(promos);
      setSummary(sum);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la información.');
    } finally {
      setLoading(false);
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
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <span className="topbar-logo">
            <TagIcon size={22} />
          </span>
          <div>
            <h1 className="topbar-title">Gestión de Promociones</h1>
            <p className="topbar-subtitle">Panel de administración · Kódigo Fuente</p>
          </div>
        </div>
      </header>

      <main className="container">
        {error && <p className="banner-error">{error}</p>}

        <SummaryCards summary={summary} />

        <div className="layout">
          <PromotionForm products={products} categories={categories} onCreate={handleCreate} />

          <section className="card list-section">
            <div className="card-header">
              <h2>Promociones</h2>
              {!loading && <span className="count-pill">{promotions.length}</span>}
            </div>
            {loading ? (
              <p className="loading">Cargando promociones…</p>
            ) : (
              <PromotionList
                promotions={promotions}
                onAdvance={handleAdvance}
                onDelete={handleDelete}
              />
            )}
          </section>
        </div>
      </main>
    </>
  );
}

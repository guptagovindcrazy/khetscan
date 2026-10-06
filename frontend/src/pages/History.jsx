import { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Search, ScanLine } from 'lucide-react';
import Button from '../components/Button';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import HistoryTable from '../components/HistoryTable';
import { deletePrediction, listPredictions } from '../services/api';

const LIMIT = 8;
const field = 'rounded-full border border-paddy-300 bg-white px-4 py-2.5 text-sm';

export default function History() {
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pagination: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => { setQuery(search.trim()); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await listPredictions({ page, limit: LIMIT, sort, ...(status && { status }), ...(query && { search: query }) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [page, sort, status, query]);

  useEffect(() => { load(); }, [load]);

  const remove = async (item) => {
    try {
      await deletePrediction(item.id);
      if (data.items.length === 1 && page > 1) setPage(page - 1);
      else load();
    } catch (err) {
      setError(err.message);
    }
  };

  const filtered = Boolean(query || status);
  const pg = data.pagination;

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Scan history</h1>
      <p className="mt-3 text-soil-600">Every leaf you have analyzed, newest first.</p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <label className="relative flex-1 sm:min-w-64">
          <span className="sr-only">Search scans</span>
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-soil-400" aria-hidden />
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search crop or disease" className={`${field} w-full pl-10`} />
        </label>
        <select aria-label="Filter by status" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} className={field}>
          <option value="">All results</option>
          <option value="diseased">Disease detected</option>
          <option value="healthy">Healthy</option>
        </select>
        <select aria-label="Sort scans" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} className={field}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="confidence_desc">Highest confidence</option>
          <option value="confidence_asc">Lowest confidence</option>
        </select>
      </div>

      <div className="mt-6">
        {error ? (
          <ErrorState title="Could not load your history" message={error} onRetry={load} />
        ) : loading && !data.items.length ? (
          <p role="status" className="py-16 text-center text-soil-600">Loading your scans…</p>
        ) : !data.items.length ? (
          filtered ? (
            <EmptyState icon={Search} title="No scans match" description="Try a different search or clear the filters."
              action={<Button variant="secondary" onClick={() => { setSearch(''); setStatus(''); }}>Clear filters</Button>} />
          ) : (
            <EmptyState icon={ScanLine} title="No scans yet" description="Your analyzed leaves will appear here."
              action={<Button to="/detect">Scan your first leaf</Button>} />
          )
        ) : (
          <>
            <HistoryTable items={data.items} onDelete={remove} />
            {pg && pg.totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-6 flex items-center justify-between">
                <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}><ChevronLeft size={16} aria-hidden />Previous</Button>
                <span className="text-sm text-soil-600">Page {pg.page} of {pg.totalPages} · {pg.total} scans</span>
                <Button variant="secondary" size="sm" disabled={page >= pg.totalPages} onClick={() => setPage(page + 1)}>Next<ChevronRight size={16} aria-hidden /></Button>
              </nav>
            )}
          </>
        )}
      </div>
    </section>
  );
}

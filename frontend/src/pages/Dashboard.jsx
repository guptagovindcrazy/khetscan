import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Activity, AlertTriangle, Gauge, Leaf, ScanSearch } from 'lucide-react';
import Button from '../components/Button';
import Card from '../components/Card';
import DiseaseBadge from '../components/DiseaseBadge';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import StatCard from '../components/StatCard';
import { getStats } from '../services/api';
import { formatDate } from '../utils/format';

const PALETTE = ['#B4472A', '#D9A21B', '#6B4A2F', '#3F7D45', '#8FBF7A', '#9A7656', '#862F18', '#244C2E'];

function lastDays(activity, n = 14) {
  const byDate = Object.fromEntries(activity.map((a) => [a.date, a.count]));
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (n - 1 - i));
    const key = d.toISOString().slice(0, 10);
    return { date: key, label: new Date(key).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'UTC' }), count: byDate[key] || 0 };
  });
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const load = () => {
    setError(null);
    getStats().then(setStats).catch((e) => setError(e.message));
  };
  useEffect(load, []);

  const activity = useMemo(() => (stats ? lastDays(stats.activity) : []), [stats]);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold sm:text-5xl">Dashboard</h1>
          <p className="mt-3 text-soil-600">What your scans have found so far.</p>
        </div>
        <Button to="/detect"><ScanSearch size={18} aria-hidden />Analyze a leaf</Button>
      </div>

      <div className="mt-8">
        {error ? (
          <ErrorState title="Could not load the dashboard" message={error} onRetry={load} />
        ) : !stats ? (
          <p role="status" className="py-16 text-center text-soil-600">Loading dashboard…</p>
        ) : stats.total === 0 ? (
          <EmptyState icon={Leaf} title="Nothing to show yet" description="Analyze your first leaf and your stats will build up here." action={<Button to="/detect">Scan a leaf</Button>} />
        ) : (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard icon={Activity} label="Total scans" value={stats.total} />
              <StatCard icon={AlertTriangle} label="Diseases detected" value={stats.diseased} />
              <StatCard icon={Leaf} label="Healthy plants" value={stats.healthy} />
              <StatCard icon={Gauge} label="Average confidence" value={`${stats.averageConfidence}%`} />
            </div>

            <div className="grid gap-6 lg:grid-cols-5">
              <Card className="lg:col-span-3">
                <h2 className="text-xl font-bold">Scans in the last 14 days</h2>
                <div className="mt-4 h-64" role="img" aria-label="Bar chart of scans per day for the last 14 days">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={activity} margin={{ left: -24, right: 4 }}>
                      <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" tickLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                      <Tooltip cursor={{ fill: '#EEF5EA' }} />
                      <Bar dataKey="count" name="Scans" fill="#3F7D45" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              <Card className="lg:col-span-2">
                <h2 className="text-xl font-bold">Disease distribution</h2>
                {stats.distribution.length === 0 ? (
                  <p className="mt-6 text-sm text-soil-600">No diseases detected. Every scan so far looks healthy.</p>
                ) : (
                  <>
                    <div className="mt-4 h-44" role="img" aria-label="Pie chart of detected diseases">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={stats.distribution} dataKey="count" nameKey="name" innerRadius={42} outerRadius={72} paddingAngle={2}>
                            {stats.distribution.map((d, i) => <Cell key={d.name} fill={PALETTE[i % PALETTE.length]} />)}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <ul className="mt-3 space-y-1.5 text-sm">
                      {stats.distribution.map((d, i) => (
                        <li key={d.name} className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PALETTE[i % PALETTE.length] }} aria-hidden />
                          <span className="flex-1 truncate">{d.name}</span><span className="tabular-nums text-soil-600">{d.count}</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </Card>
            </div>

            <Card>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Recent scans</h2>
                <Link to="/history" className="text-sm font-semibold text-paddy-700 hover:underline">View all</Link>
              </div>
              <ul className="mt-4 divide-y divide-paddy-100">
                {stats.recent.map((p) => (
                  <li key={p.id}>
                    <Link to={`/history/${p.id}`} className="flex items-center gap-4 py-3 hover:bg-paddy-50/60">
                      <img src={p.imageUrl} alt="" loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{p.cropName}: {p.predictedDisease}</p>
                        <p className="text-sm text-soil-600">{formatDate(p.createdAt)} · {p.confidence.toFixed(1)}%</p>
                      </div>
                      <DiseaseBadge status={p.status} className="hidden sm:inline-flex" />
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
}

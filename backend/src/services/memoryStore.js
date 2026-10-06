const crypto = require('crypto');

/** In-memory store for STORAGE_MODE=memory (local development without MongoDB). */
const items = [];

const clone = (x) => JSON.parse(JSON.stringify(x));
const dayKey = (d) => new Date(d).toISOString().slice(0, 10);

async function create(data) {
  const now = new Date().toISOString();
  const doc = { ...clone(data), id: crypto.randomBytes(12).toString('hex'), createdAt: now, updatedAt: now };
  items.push(doc);
  return clone(doc);
}

async function list({ page, limit, status, sort, search }) {
  let rows = items.filter((p) => !status || p.status === status);
  if (search) {
    const q = search.toLowerCase();
    rows = rows.filter((p) => [p.cropName, p.predictedDisease, p.originalFileName].some((v) => v.toLowerCase().includes(q)));
  }
  const byDate = (a, b) => b.createdAt.localeCompare(a.createdAt);
  const sorters = {
    newest: byDate,
    oldest: (a, b) => -byDate(a, b),
    confidence_desc: (a, b) => b.confidence - a.confidence || byDate(a, b),
    confidence_asc: (a, b) => a.confidence - b.confidence || byDate(a, b),
  };
  rows = [...rows].sort(sorters[sort]);
  return { items: clone(rows.slice((page - 1) * limit, page * limit)), total: rows.length };
}

async function findById(id) {
  const doc = items.find((p) => p.id === id);
  return doc ? clone(doc) : null;
}

async function remove(id) {
  const idx = items.findIndex((p) => p.id === id);
  return idx === -1 ? null : clone(items.splice(idx, 1)[0]);
}

async function stats() {
  const total = items.length;
  const diseased = items.filter((p) => p.status === 'diseased');
  const counts = new Map();
  diseased.forEach((p) => counts.set(`${p.cropName} ${p.predictedDisease}`, (counts.get(`${p.cropName} ${p.predictedDisease}`) || 0) + 1));
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);
  const perDay = new Map();
  items.filter((p) => new Date(p.createdAt) >= since).forEach((p) => perDay.set(dayKey(p.createdAt), (perDay.get(dayKey(p.createdAt)) || 0) + 1));
  const avg = total ? items.reduce((s, p) => s + p.confidence, 0) / total : 0;
  return {
    total,
    diseased: diseased.length,
    healthy: total - diseased.length,
    averageConfidence: Math.round(avg * 10) / 10,
    distribution: [...counts].map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    activity: [...perDay].map(([date, count]) => ({ date, count })),
    recent: clone([...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)),
  };
}

module.exports = { create, list, findById, remove, stats };

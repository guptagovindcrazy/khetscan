const Prediction = require('../models/Prediction');
const { escapeRegex } = require('./listQuery');

const SORT_MAP = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  confidence_desc: { confidence: -1, createdAt: -1 },
  confidence_asc: { confidence: 1, createdAt: -1 },
};

const toJson = (doc) => (doc ? doc.toJSON() : null);

async function create(data) {
  return toJson(await Prediction.create(data));
}

async function list({ page, limit, status, sort, search }) {
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const rx = new RegExp(escapeRegex(search), 'i');
    filter.$or = [{ cropName: rx }, { predictedDisease: rx }, { originalFileName: rx }];
  }
  const [docs, total] = await Promise.all([
    Prediction.find(filter).sort(SORT_MAP[sort]).skip((page - 1) * limit).limit(limit),
    Prediction.countDocuments(filter),
  ]);
  return { items: docs.map(toJson), total };
}

async function findById(id) {
  return toJson(await Prediction.findById(id));
}

async function remove(id) {
  return toJson(await Prediction.findByIdAndDelete(id));
}

async function stats() {
  const since = new Date();
  since.setUTCHours(0, 0, 0, 0);
  since.setUTCDate(since.getUTCDate() - 13);

  const [result] = await Prediction.aggregate([
    {
      $facet: {
        totals: [{ $group: { _id: null, total: { $sum: 1 }, avg: { $avg: '$confidence' },
          diseased: { $sum: { $cond: [{ $eq: ['$status', 'diseased'] }, 1, 0] } } } }],
        distribution: [
          { $match: { status: 'diseased' } },
          { $group: { _id: { crop: '$cropName', disease: '$predictedDisease' }, count: { $sum: 1 } } },
          { $sort: { count: -1 } }, { $limit: 8 },
        ],
        activity: [
          { $match: { createdAt: { $gte: since } } },
          { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        ],
        recent: [{ $sort: { createdAt: -1 } }, { $limit: 5 }],
      },
    },
  ]);
  const t = result.totals[0] || { total: 0, avg: 0, diseased: 0 };
  return {
    total: t.total,
    diseased: t.diseased,
    healthy: t.total - t.diseased,
    averageConfidence: Math.round((t.avg || 0) * 10) / 10,
    distribution: result.distribution.map((d) => ({ name: `${d._id.crop} ${d._id.disease}`, count: d.count })),
    activity: result.activity.map((a) => ({ date: a._id, count: a.count })),
    recent: result.recent.map((d) => Prediction.hydrate(d).toJSON()),
  };
}

module.exports = { create, list, findById, remove, stats };

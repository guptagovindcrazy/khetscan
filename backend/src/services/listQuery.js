const AppError = require('../utils/AppError');

const SORTS = ['newest', 'oldest', 'confidence_desc', 'confidence_asc'];
const STATUSES = ['healthy', 'diseased'];

/** Validates and normalises GET /api/predictions query parameters. */
function parseListQuery(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 12 : Number(query.limit);
  if (!Number.isInteger(page) || page < 1) throw new AppError(400, 'VALIDATION_ERROR', 'page must be a positive integer.');
  if (!Number.isInteger(limit) || limit < 1 || limit > 50) throw new AppError(400, 'VALIDATION_ERROR', 'limit must be between 1 and 50.');

  const status = query.status || undefined;
  if (status && !STATUSES.includes(status)) throw new AppError(400, 'VALIDATION_ERROR', 'status must be healthy or diseased.');
  const sort = query.sort || 'newest';
  if (!SORTS.includes(sort)) throw new AppError(400, 'VALIDATION_ERROR', `sort must be one of: ${SORTS.join(', ')}.`);
  const search = typeof query.search === 'string' ? query.search.trim().slice(0, 80) : '';
  return { page, limit, status, sort, search };
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

module.exports = { parseListQuery, escapeRegex };

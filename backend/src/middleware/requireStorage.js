const config = require('../config/env');
const { isConnected } = require('../config/db');
const AppError = require('../utils/AppError');

module.exports = (_req, _res, next) => {
  if (config.storageMode === 'mongo' && !isConnected()) {
    return next(new AppError(503, 'DATABASE_UNAVAILABLE', 'The database is temporarily unavailable. Please try again shortly.'));
  }
  next();
};

require('dotenv').config();

const int = (value, fallback) => {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
};

const path = require('path');

const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: int(process.env.PORT, 5000),
  storageMode: process.env.STORAGE_MODE === 'memory' ? 'memory' : 'mongo',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/plant_disease',
  mlServiceUrl: (process.env.ML_SERVICE_URL || 'http://localhost:8000').replace(/\/$/, ''),
  mlTimeoutMs: int(process.env.ML_TIMEOUT_MS, 30000),
  maxFileMb: int(process.env.MAX_FILE_MB, 10),
  corsOrigins: (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',').map((s) => s.trim()).filter(Boolean),
  uploadDir: path.resolve(process.env.UPLOAD_DIR || 'uploads'),
};
config.isProduction = config.nodeEnv === 'production';

module.exports = config;

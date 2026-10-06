const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const config = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
// Uploaded images are shown by the frontend, which is served from a different origin in development.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: config.corsOrigins }));
if (config.nodeEnv !== 'test') app.use(morgan(config.isProduction ? 'combined' : 'dev'));
app.use(express.json({ limit: '100kb' }));
app.use('/api', rateLimit({
  windowMs: 60 * 1000,
  limit: config.nodeEnv === 'test' ? 10000 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests. Please slow down and try again.' } },
}));

app.use('/uploads', express.static(config.uploadDir, { index: false, dotfiles: 'deny', maxAge: '7d' }));
app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

const app = require('./app');
const config = require('./config/env');
const { connectWithRetry } = require('./config/db');

if (config.storageMode === 'mongo') connectWithRetry();
else console.warn('STORAGE_MODE=memory: predictions are kept in memory and lost on restart.');

const server = app.listen(config.port, () => {
  console.log(`API listening on :${config.port} (${config.nodeEnv}, storage=${config.storageMode})`);
});

const shutdown = () => server.close(() => process.exit(0));
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

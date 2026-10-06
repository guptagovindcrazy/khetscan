const mongoose = require('mongoose');
const config = require('./env');

/** Connects to MongoDB and keeps retrying in the background so the API can start before the DB. */
function connectWithRetry(delayMs = 5000) {
  const attempt = async () => {
    try {
      await mongoose.connect(config.mongoUri, { serverSelectionTimeoutMS: 4000 });
      console.log('MongoDB connected');
    } catch (err) {
      console.error(`MongoDB unavailable (${err.name}); retrying in ${delayMs / 1000}s`);
      setTimeout(attempt, delayMs).unref();
    }
  };
  attempt();
}

const isConnected = () => mongoose.connection.readyState === 1;

module.exports = { connectWithRetry, isConnected };

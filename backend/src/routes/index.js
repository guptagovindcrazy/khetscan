const express = require('express');
const config = require('../config/env');
const { isConnected } = require('../config/db');
const mlService = require('../services/mlService');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/health', asyncHandler(async (_req, res) => {
  const ml = await mlService.health();
  const dbOk = config.storageMode === 'memory' || isConnected();
  const mlOk = Boolean(ml) && ml.status === 'ok';
  res.status(200).json({
    success: true,
    data: {
      status: dbOk && mlOk ? 'ok' : 'degraded',
      uptimeSeconds: Math.round(process.uptime()),
      storage: { mode: config.storageMode, connected: dbOk },
      ml: ml
        ? { reachable: true, status: ml.status, mode: ml.mode, simulated: ml.simulated }
        : { reachable: false },
    },
  });
}));

router.use('/predictions', require('./predictionRoutes'));

module.exports = router;

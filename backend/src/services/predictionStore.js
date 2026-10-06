const config = require('../config/env');

module.exports = config.storageMode === 'memory' ? require('./memoryStore') : require('./mongoStore');

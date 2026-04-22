const mongoose = require('mongoose');
const { mongoConfig, validateMongoConfig } = require('./mongo.config');
const { logger } = require('../utils/logger');

const connectDatabase = async () => {
  try {
    validateMongoConfig();

    await mongoose.connect(mongoConfig.uri);

    logger.info('MongoDB connection established successfully', {
      event: 'mongodb.connection.succeeded',
    });
  } catch (error) {
    logger.error('MongoDB connection failed', {
      event: 'mongodb.connection.failed',
      error: error.message,
    });

    if (/querySrv|ENOTFOUND|timed out/i.test(error.message || '')) {
      logger.warn('MongoDB connectivity diagnostics hint', {
        event: 'mongodb.connection.hint',
        hint: 'Check Atlas Network Access allowlist, DNS resolution, and outbound firewall rules for port 27017.',
      });
    }

    process.exit(1);
  }
};

const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB connection closed', {
      event: 'mongodb.connection.closed',
    });
  } catch (error) {
    logger.error('Error disconnecting MongoDB', {
      event: 'mongodb.disconnection.failed',
      error: error.message,
    });
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase,
  validateMongoConfig,
};

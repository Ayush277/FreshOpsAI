const { env } = require('../config/env');

const LOG_LEVELS = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const resolveLogLevel = () => {
  const normalizedLevel = String(env.logLevel || 'info').toLowerCase();
  return LOG_LEVELS[normalizedLevel] ? normalizedLevel : 'info';
};

const shouldLog = (level) => {
  const activeLevel = resolveLogLevel();
  return LOG_LEVELS[level] >= LOG_LEVELS[activeLevel];
};

const buildBaseEntry = (level, message, meta = {}) => {
  return {
    timestamp: new Date().toISOString(),
    level,
    service: 'freshops-ai-backend',
    environment: env.nodeEnv,
    message,
    ...meta,
  };
};

const emitLog = (level, message, meta = {}) => {
  if (!shouldLog(level)) {
    return;
  }

  const entry = buildBaseEntry(level, message, meta);
  const serializedEntry = JSON.stringify(entry);

  if (level === 'error' || level === 'warn') {
    console.error(serializedEntry);
    return;
  }

  console.log(serializedEntry);
};

const logger = {
  debug: (message, meta) => emitLog('debug', message, meta),
  info: (message, meta) => emitLog('info', message, meta),
  warn: (message, meta) => emitLog('warn', message, meta),
  error: (message, meta) => emitLog('error', message, meta),
};

module.exports = {
  logger,
};

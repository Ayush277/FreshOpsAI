const { env } = require('./env');

const appConfig = {
  nodeEnv: env.nodeEnv,
  port: env.port,
  corsOrigin: env.corsOrigin,
  logLevel: env.logLevel,
};

module.exports = {
  appConfig,
};

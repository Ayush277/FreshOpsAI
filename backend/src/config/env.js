const path = require('path');
const dotenv = require('dotenv');

dotenv.config({
  path: process.env.ENV_FILE
    ? path.resolve(process.cwd(), process.env.ENV_FILE)
    : path.resolve(process.cwd(), '.env'),
});

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 4000,
  corsOrigin: process.env.CORS_ORIGIN || '*',
};

module.exports = { env };

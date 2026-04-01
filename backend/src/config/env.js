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
  clarifaiPat: process.env.CLARIFAI_PAT || '',
  clarifaiUserId: process.env.CLARIFAI_USER_ID || '',
  clarifaiAppId: process.env.CLARIFAI_APP_ID || '',
  clarifaiModelId: process.env.CLARIFAI_MODEL_ID || 'food-item-recognition',
};

module.exports = { env };

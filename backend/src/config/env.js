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
  logLevel: process.env.LOG_LEVEL || 'info',
  mongoUri: process.env.MONGODB_URI || '',
  clarifaiPat: process.env.CLARIFAI_PAT || '',
  clarifaiUserId: process.env.CLARIFAI_USER_ID || '',
  clarifaiAppId: process.env.CLARIFAI_APP_ID || '',
  clarifaiModelId: process.env.CLARIFAI_MODEL_ID || 'food-item-recognition',
  awsRegion: process.env.AWS_REGION || '',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  awsS3Bucket: process.env.AWS_S3_BUCKET || '',
  awsS3Prefix: process.env.AWS_S3_PREFIX || 'freshops/uploads',
  awsS3PublicBaseUrl: process.env.AWS_S3_PUBLIC_BASE_URL || '',
};

module.exports = { env };

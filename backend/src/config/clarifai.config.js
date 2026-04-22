const { env } = require('./env');

const clarifaiConfig = {
  pat: env.clarifaiPat,
  userId: env.clarifaiUserId,
  appId: env.clarifaiAppId,
  modelId: env.clarifaiModelId,
  apiBaseUrl: 'https://api.clarifai.com/v2/models',
};

const hasPlaceholder = (value) => {
  return typeof value === 'string' && value.includes('<') && value.includes('>');
};

const hasUsableValue = (value) => {
  return Boolean(value) && !hasPlaceholder(value);
};

const isClarifaiConfigured = () => {
  return Boolean(
    hasUsableValue(clarifaiConfig.pat) &&
      hasUsableValue(clarifaiConfig.userId) &&
      hasUsableValue(clarifaiConfig.appId) &&
      hasUsableValue(clarifaiConfig.modelId)
  );
};

const getClarifaiDiagnostics = () => {
  return {
    configured: isClarifaiConfigured(),
    hasPat: hasUsableValue(clarifaiConfig.pat),
    userIdSet: hasUsableValue(clarifaiConfig.userId),
    appIdSet: hasUsableValue(clarifaiConfig.appId),
    modelId: clarifaiConfig.modelId || null,
  };
};

module.exports = {
  clarifaiConfig,
  isClarifaiConfigured,
  getClarifaiDiagnostics,
};

require('./env');
const { env } = require('./env');

const mongoConfig = {
  uri: env.mongoUri || '',
};

const isPlaceholderValue = (value) => {
  return typeof value === 'string' && value.includes('<') && value.includes('>');
};

const getMongoDiagnostics = () => {
  const hasUri = Boolean(mongoConfig.uri);
  const usesPlaceholder = isPlaceholderValue(mongoConfig.uri);

  if (!hasUri || usesPlaceholder) {
    return {
      configured: false,
      host: null,
      database: null,
      usesPlaceholder,
    };
  }

  try {
    const parsedUri = new URL(mongoConfig.uri);
    const database = parsedUri.pathname?.replace(/^\//, '') || null;

    return {
      configured: true,
      host: parsedUri.hostname,
      database,
      usesPlaceholder,
    };
  } catch (error) {
    return {
      configured: false,
      host: null,
      database: null,
      reason: 'Invalid MONGODB_URI format',
      usesPlaceholder,
    };
  }
};

const validateMongoConfig = () => {
  if (!mongoConfig.uri) {
    const error = new Error(
      'MONGODB_URI environment variable is not set. Please configure it before starting the application.'
    );
    error.statusCode = 500;
    throw error;
  }

  if (isPlaceholderValue(mongoConfig.uri)) {
    const error = new Error(
      'MONGODB_URI contains placeholder values. Replace placeholders with real Atlas credentials before starting the application.'
    );
    error.statusCode = 500;
    throw error;
  }

  try {
    new URL(mongoConfig.uri);
  } catch (cause) {
    const error = new Error('MONGODB_URI is invalid. Please provide a valid MongoDB connection string.');
    error.statusCode = 500;
    error.cause = cause;
    throw error;
  }
};

module.exports = {
  mongoConfig,
  getMongoDiagnostics,
  validateMongoConfig,
};

const app = require('./app');
const { appConfig } = require('./config/app.config');
const { getMongoDiagnostics } = require('./config/mongo.config');
const { getClarifaiDiagnostics } = require('./config/clarifai.config');
const { getAwsDiagnostics } = require('./config/aws.config');
const { logger } = require('./utils/logger');

// Handle uncaught exceptions and rejections gracefully
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection encountered', {
    event: 'process.unhandledRejection',
    reason: reason.message || reason,
    stack: reason.stack
  });
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception encountered', {
    event: 'process.uncaughtException',
    error: error.message,
    stack: error.stack
  });
  process.exit(1);
});

const logStartupDiagnostics = () => {
  const mongoDiagnostics = getMongoDiagnostics();
  const clarifaiDiagnostics = getClarifaiDiagnostics();
  const awsDiagnostics = getAwsDiagnostics();

  logger.info('Startup diagnostics initialized', {
    event: 'startup.diagnostics.begin',
    port: appConfig.port,
    nodeEnv: appConfig.nodeEnv,
    logLevel: appConfig.logLevel,
  });

  logger.info('MongoDB configuration diagnostics', {
    event: 'startup.diagnostics.mongodb',
    ...mongoDiagnostics,
  });

  if (!mongoDiagnostics.configured) {
    logger.warn('MongoDB startup diagnostics require attention', {
      event: 'startup.diagnostics.mongodb.warning',
      hint: 'Set a valid MONGODB_URI for Atlas or local MongoDB before starting the backend.',
    });
  }

  logger.info('Clarifai configuration diagnostics', {
    event: 'startup.diagnostics.clarifai',
    ...clarifaiDiagnostics,
  });

  if (!clarifaiDiagnostics.configured) {
    logger.warn('Clarifai startup diagnostics require attention', {
      event: 'startup.diagnostics.clarifai.warning',
      hint: 'Set CLARIFAI_PAT, CLARIFAI_USER_ID, CLARIFAI_APP_ID, and CLARIFAI_MODEL_ID to enable AI detection.',
    });
  }

  logger.info('AWS S3 configuration diagnostics', {
    event: 'startup.diagnostics.aws',
    ...awsDiagnostics,
  });

  if (!awsDiagnostics.configured) {
    logger.warn('AWS S3 startup diagnostics require attention', {
      event: 'startup.diagnostics.aws.warning',
      hint: 'Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET to enable cloud image storage.',
    });
  }
};

const startServer = async () => {
  try {
    logStartupDiagnostics();

    await app.connectDatabase();

    app.listen(appConfig.port, () => {
      logger.info('FreshOps AI backend listening', {
        event: 'server.started',
        port: appConfig.port,
        nodeEnv: appConfig.nodeEnv,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', {
      event: 'server.start.failed',
      error: error.message,
    });

    process.exit(1);
  }
};

startServer();

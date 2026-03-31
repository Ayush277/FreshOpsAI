const app = require('./app');
const { env } = require('./config/env');

const startServer = async () => {
  try {
    await app.connectDatabase();

    app.listen(env.port, () => {
      console.log(`FreshOps AI backend listening on port ${env.port} (${env.nodeEnv})`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

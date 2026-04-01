const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');
const { env } = require('./config/env');
const { connectDatabase } = require('./config/database');
const { notFoundHandler } = require('./middleware/not-found.middleware');
const { errorHandler } = require('./middleware/error.middleware');
const { sendSuccess } = require('./utils/api-response');

const app = express();

app.connectDatabase = connectDatabase;

app.use(
  cors({
    origin: env.corsOrigin,
  })
);
app.use(express.json());
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/', (request, response) => {
  return sendSuccess(response, {
    message: 'FreshOps AI backend is running',
    data: {
      service: 'freshops-ai-backend',
      docs: '/health',
    },
  });
});

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

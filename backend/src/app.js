const express = require('express');
const cors = require('cors');
const routes = require('./routes');
const { env } = require('./config/env');
const { notFoundHandler } = require('./middleware/not-found.middleware');
const { errorHandler } = require('./middleware/error.middleware');

const app = express();

app.use(
  cors({
    origin: env.corsOrigin,
  })
);
app.use(express.json());

app.get('/', (request, response) => {
  response.status(200).json({
    service: 'freshops-ai-backend',
    message: 'FreshOps AI backend is running.',
    docs: '/health',
  });
});

app.use('/', routes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

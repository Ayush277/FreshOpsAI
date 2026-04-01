const { sendError } = require('../utils/api-response');

const notFoundHandler = (request, response) => {
  return sendError(response, {
    statusCode: 404,
    message: `Route not found: ${request.method} ${request.originalUrl}`,
    errors: [
      {
        field: 'route',
        message: 'Requested endpoint does not exist',
      },
    ],
  });
};

module.exports = { notFoundHandler };

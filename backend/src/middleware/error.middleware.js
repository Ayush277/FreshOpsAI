const mongoose = require('mongoose');
const { sendError } = require('../utils/api-response');

const buildMongooseValidationErrors = (error) => {
  return Object.values(error.errors || {}).map((validationError) => ({
    field: validationError.path,
    message: validationError.message,
  }));
};

const errorHandler = (error, request, response, next) => {
  if (error instanceof mongoose.Error.ValidationError) {
    return sendError(response, {
      statusCode: 400,
      message: 'Validation failed',
      errors: buildMongooseValidationErrors(error),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return sendError(response, {
      statusCode: 400,
      message: 'Invalid request parameter',
      errors: [
        {
          field: error.path,
          message: `Invalid value for ${error.path}`,
        },
      ],
    });
  }

  const statusCode = error.statusCode || 500;
  const errors = Array.isArray(error.errors) ? error.errors : [];

  return sendError(response, {
    statusCode,
    message: error.message || 'Internal Server Error',
    errors,
  });
};

module.exports = { errorHandler };

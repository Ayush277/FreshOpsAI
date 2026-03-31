const errorHandler = (error, request, response, next) => {
  const statusCode = error.statusCode || 500;

  response.status(statusCode).json({
    status: 'error',
    message: error.message || 'Internal Server Error',
  });
};

module.exports = { errorHandler };

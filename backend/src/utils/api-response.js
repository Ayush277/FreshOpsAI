const sendSuccess = (response, { statusCode = 200, message, data = null, meta } = {}) => {
  const payload = {
    success: true,
    status: 'success',
    message,
    data,
  };

  if (meta) {
    payload.meta = meta;
  }

  return response.status(statusCode).json(payload);
};

const sendError = (
  response,
  { statusCode = 500, message = 'Internal Server Error', errors = [] } = {}
) => {
  return response.status(statusCode).json({
    success: false,
    status: 'error',
    message,
    errors,
  });
};

module.exports = {
  sendSuccess,
  sendError,
};

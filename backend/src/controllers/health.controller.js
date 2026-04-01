const { getHealthStatus } = require('../services/health.service');
const { sendSuccess } = require('../utils/api-response');

const getHealth = (request, response) => {
  const health = getHealthStatus();
  return sendSuccess(response, {
    message: 'Health check retrieved successfully',
    data: health,
  });
};

module.exports = { getHealth };

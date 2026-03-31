const { getHealthStatus } = require('../services/health.service');

const getHealth = (request, response) => {
  const health = getHealthStatus();
  response.status(200).json(health);
};

module.exports = { getHealth };

const getHealthStatus = () => {
  return {
    status: 'ok',
    service: 'freshops-ai-backend',
    timestamp: new Date().toISOString(),
  };
};

module.exports = { getHealthStatus };

const { getAlertsService } = require('../services/alerts.service');

const getAlerts = async (request, response, next) => {
  try {
    const alerts = await getAlertsService();

    response.status(200).json({
      status: 'success',
      message: 'Alerts retrieved successfully',
      count: alerts.length,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts };

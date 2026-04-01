const { getAlertsService } = require('../services/alerts.service');

const getAlerts = async (request, response, next) => {
  try {
    const alertsPayload = await getAlertsService();

    response.status(200).json({
      status: 'success',
      message: 'Alerts retrieved successfully',
      count: alertsPayload.alertCount,
      data: alertsPayload.alerts,
      summary: {
        totalItems: alertsPayload.totalItems,
        buckets: alertsPayload.buckets,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAlerts };

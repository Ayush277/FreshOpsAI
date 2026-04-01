const { getAlertsService } = require('../services/alerts.service');
const { sendSuccess } = require('../utils/api-response');

const getAlerts = async (request, response, next) => {
  try {
    const alertsPayload = await getAlertsService();

    return sendSuccess(response, {
      message: 'Alerts retrieved successfully',
      data: alertsPayload.alerts,
      meta: {
        count: alertsPayload.alertCount,
        totalItems: alertsPayload.totalItems,
        buckets: alertsPayload.buckets,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getAlerts };

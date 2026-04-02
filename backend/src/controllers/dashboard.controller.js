const { getDashboardSummaryService } = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/api-response');

const getDashboardSummary = async (request, response, next) => {
  try {
    const summary = await getDashboardSummaryService();

    return sendSuccess(response, {
      message: 'Dashboard summary retrieved successfully',
      data: summary,
      meta: {
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getDashboardSummary };

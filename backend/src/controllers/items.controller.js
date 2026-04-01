const { getItemsService } = require('../services/items.service');
const { sendSuccess } = require('../utils/api-response');

const getItems = async (request, response, next) => {
  try {
    const items = await getItemsService();

    return sendSuccess(response, {
      message: 'Items retrieved successfully',
      data: items,
      meta: {
        count: items.length,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getItems };

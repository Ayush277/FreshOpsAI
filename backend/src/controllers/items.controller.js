const { getItemsService } = require('../services/items.service');

const getItems = async (request, response, next) => {
  try {
    const items = await getItemsService();

    response.status(200).json({
      status: 'success',
      message: 'Items retrieved successfully',
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getItems };

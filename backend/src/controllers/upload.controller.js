const { uploadService } = require('../services/upload.service');
const { sendSuccess } = require('../utils/api-response');

const postUpload = async (request, response, next) => {
  try {
    const { itemName, category, imageUrl, detectedAt, expiryDate, daysRemaining } =
      request.validatedBody;

    const uploadedItem = await uploadService({
      itemName,
      category,
      imageUrl,
      detectedAt,
      expiryDate,
      daysRemaining,
    });

    return sendSuccess(response, {
      statusCode: 201,
      message: 'Item uploaded successfully',
      data: uploadedItem,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { postUpload };

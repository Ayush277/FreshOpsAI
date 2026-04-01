const { uploadService } = require('../services/upload.service');

const postUpload = async (request, response, next) => {
  try {
    const {
      itemName,
      category,
      imageUrl,
      detectedAt,
      expiryDate,
      daysRemaining,
    } = request.body;

    if (!itemName || typeof itemName !== 'string' || !itemName.trim()) {
      const error = new Error(
        'itemName is required for manual testing until AI detection is integrated'
      );
      error.statusCode = 400;
      throw error;
    }

    const uploadedItem = await uploadService({
      itemName: itemName.trim(),
      category,
      imageUrl,
      detectedAt,
      expiryDate,
      daysRemaining,
    });

    response.status(201).json({
      status: 'success',
      message: 'Item uploaded successfully',
      data: uploadedItem,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { postUpload };

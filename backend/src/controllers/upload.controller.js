const { uploadService } = require('../services/upload.service');

const postUpload = async (request, response, next) => {
  try {
    const { itemName, category, imageUrl } = request.body;

    const uploadedItem = await uploadService({
      itemName,
      category,
      imageUrl,
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

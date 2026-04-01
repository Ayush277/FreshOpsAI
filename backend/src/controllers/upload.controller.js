const { uploadService } = require('../services/upload.service');
const { sendSuccess } = require('../utils/api-response');

const postUpload = async (request, response, next) => {
  try {
    const { itemName, category, imageUrl, detectedAt, expiryDate, daysRemaining } =
      request.validatedBody;

    const uploadedFile = request.file;
    const fileUrl = uploadedFile ? `/uploads/${uploadedFile.filename}` : imageUrl;

    const uploadedItem = await uploadService({
      itemName,
      category,
      imageUrl: fileUrl,
      detectedAt,
      expiryDate,
      daysRemaining,
    });

    return sendSuccess(response, {
      statusCode: 201,
      message: 'Item uploaded successfully',
      data: {
        item: uploadedItem,
        file: uploadedFile
          ? {
              fieldName: uploadedFile.fieldname,
              originalName: uploadedFile.originalname,
              mimeType: uploadedFile.mimetype,
              size: uploadedFile.size,
              filename: uploadedFile.filename,
              path: fileUrl,
            }
          : null,
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { postUpload };

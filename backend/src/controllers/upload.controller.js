const { uploadService } = require('../services/upload.service');
const { detectFoodLabel } = require('../services/clarifai.service');
const { sendSuccess } = require('../utils/api-response');
const { AppError } = require('../utils/app-error');

const postUpload = async (request, response, next) => {
  try {
    const { itemName, category, imageUrl, detectedAt, expiryDate, daysRemaining } =
      request.validatedBody;

    const uploadedFile = request.file;
    const fileUrl = uploadedFile ? `/uploads/${uploadedFile.filename}` : imageUrl;

    const aiDetection = await detectFoodLabel({
      imageUrl,
      filePath: uploadedFile?.path,
    });

    const resolvedItemName = aiDetection.success ? aiDetection.label : itemName;

    if (!resolvedItemName) {
      throw new AppError(
        'Unable to determine item name. Provide manual itemName or configure Clarifai correctly.',
        400,
        [
          {
            field: 'itemName',
            message: aiDetection.reason || 'No manual itemName and AI detection unavailable.',
          },
        ]
      );
    }

    const uploadedItem = await uploadService({
      itemName: resolvedItemName,
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
        aiDetection: {
          provider: aiDetection.provider || 'clarifai',
          success: aiDetection.success,
          detectedLabel: aiDetection.success ? aiDetection.label : null,
          confidence: aiDetection.success ? aiDetection.confidence : null,
          reason: aiDetection.success ? null : aiDetection.reason,
          details: aiDetection.success ? null : aiDetection.details || null,
          usedFallbackItemName: !aiDetection.success && Boolean(itemName),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { postUpload };

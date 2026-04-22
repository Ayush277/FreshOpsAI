const { uploadService } = require('../services/upload.service');
const { detectFoodLabel } = require('../services/clarifai.service');
const { uploadImageToS3 } = require('../services/s3.service');
const { sendSuccess } = require('../utils/api-response');
const { AppError } = require('../utils/app-error');

const postUpload = async (request, response, next) => {
  try {
    const { itemName, category, imageUrl, detectedAt, expiryDate, daysRemaining } =
      request.validatedBody;

    const uploadedFile = request.file;
    let fileUrl = imageUrl;
    let s3UploadResult = null;

    if (uploadedFile) {
      s3UploadResult = await uploadImageToS3(uploadedFile);
      fileUrl = s3UploadResult.url;
    }

    const aiDetection = await detectFoodLabel({
      imageUrl: imageUrl || fileUrl,
      fileBuffer: uploadedFile?.buffer,
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
      aiDetection,
    });

    return sendSuccess(response, {
      statusCode: 201,
      message: 'Item uploaded successfully',
      data: {
        item: uploadedItem.item,
        expiryPlan: uploadedItem.expiryPlan,
        file: uploadedFile
          ? {
              fieldName: uploadedFile.fieldname,
              originalName: uploadedFile.originalname,
              mimeType: uploadedFile.mimetype,
              size: uploadedFile.size,
              storage: 's3',
              bucket: s3UploadResult?.bucket || null,
              key: s3UploadResult?.key || null,
              url: fileUrl,
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

const { AppError } = require('../utils/app-error');

const ALLOWED_CATEGORIES = ['Dairy', 'Bakery', 'Fruits', 'Vegetables', 'Meat', 'General'];

const isValidDateString = (value) => !Number.isNaN(new Date(value).getTime());

const validateUploadRequest = (request, response, next) => {
  const hasUploadedFile = Boolean(request.file);
  const {
    itemName,
    category,
    imageUrl,
    detectedAt,
    expiryDate,
    daysRemaining,
  } = request.body || {};

  const validationErrors = [];

  if (!itemName || typeof itemName !== 'string' || !itemName.trim()) {
    validationErrors.push({
      field: 'itemName',
      message:
        'itemName is required for manual testing until AI detection is integrated',
    });
  }

  if (category && !ALLOWED_CATEGORIES.includes(category)) {
    validationErrors.push({
      field: 'category',
      message: `category must be one of: ${ALLOWED_CATEGORIES.join(', ')}`,
    });
  }

  if (imageUrl) {
    try {
      new URL(imageUrl);
    } catch (error) {
      if (!hasUploadedFile) {
        validationErrors.push({
          field: 'imageUrl',
          message: 'imageUrl must be a valid URL',
        });
      }
    }
  }

  if (!imageUrl && !hasUploadedFile) {
    validationErrors.push({
      field: 'image',
      message: 'Provide either imageUrl or upload an image file using field name "image"',
    });
  }

  if (hasUploadedFile && !request.file.mimetype.startsWith('image/')) {
    validationErrors.push({
      field: 'image',
      message: 'Uploaded file must be an image',
    });
  }

  if (detectedAt && !isValidDateString(detectedAt)) {
    validationErrors.push({
      field: 'detectedAt',
      message: 'detectedAt must be a valid date',
    });
  }

  if (expiryDate && !isValidDateString(expiryDate)) {
    validationErrors.push({
      field: 'expiryDate',
      message: 'expiryDate must be a valid date',
    });
  }

  if (daysRemaining !== undefined && daysRemaining !== null && Number.isNaN(Number(daysRemaining))) {
    validationErrors.push({
      field: 'daysRemaining',
      message: 'daysRemaining must be a valid number',
    });
  }

  if (validationErrors.length > 0) {
    return next(new AppError('Validation failed for upload request', 400, validationErrors));
  }

  request.validatedBody = {
    itemName: itemName ? itemName.trim() : itemName,
    category,
    imageUrl,
    detectedAt,
    expiryDate,
    daysRemaining:
      daysRemaining !== undefined && daysRemaining !== null ? Number(daysRemaining) : undefined,
  };

  return next();
};

module.exports = {
  validateUploadRequest,
};

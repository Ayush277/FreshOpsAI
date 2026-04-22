const crypto = require('crypto');
const path = require('path');
const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { awsConfig, isS3Configured } = require('../config/aws.config');
const { logger } = require('../utils/logger');
const { AppError } = require('../utils/app-error');

let s3ClientInstance;

const getS3Client = () => {
  if (!s3ClientInstance) {
    s3ClientInstance = new S3Client({
      region: awsConfig.region,
      credentials: {
        accessKeyId: awsConfig.accessKeyId,
        secretAccessKey: awsConfig.secretAccessKey,
      },
    });
  }

  return s3ClientInstance;
};

const buildObjectUrl = (key) => {
  if (awsConfig.s3PublicBaseUrl) {
    const baseUrl = awsConfig.s3PublicBaseUrl.replace(/\/+$/, '');
    return `${baseUrl}/${key}`;
  }

  if (awsConfig.region === 'us-east-1') {
    return `https://${awsConfig.s3Bucket}.s3.amazonaws.com/${key}`;
  }

  return `https://${awsConfig.s3Bucket}.s3.${awsConfig.region}.amazonaws.com/${key}`;
};

const uploadImageToS3 = async (file) => {
  if (!file?.buffer || !file?.mimetype) {
    throw new AppError('A valid image file is required for S3 upload.', 400);
  }

  if (!file.mimetype.startsWith('image/')) {
    throw new AppError('Only image files are allowed for S3 upload.', 400);
  }

  if (!isS3Configured()) {
    throw new AppError(
      'AWS S3 is not configured. Set AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and AWS_S3_BUCKET.',
      500
    );
  }

  const extension = path.extname(file.originalname || '').toLowerCase();
  const normalizedPrefix = (awsConfig.s3Prefix || '').replace(/^\/+|\/+$/g, '');
  const keyBase = `${Date.now()}-${crypto.randomUUID()}`;
  const key = normalizedPrefix ? `${normalizedPrefix}/${keyBase}${extension}` : `${keyBase}${extension}`;

  const client = getS3Client();

  try {
    await client.send(
      new PutObjectCommand({
        Bucket: awsConfig.s3Bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );
  } catch (error) {
    logger.error('S3 upload failed', {
      event: 'aws.s3.upload.failed',
      bucket: awsConfig.s3Bucket,
      key,
      error: error.message,
    });

    throw new AppError('Failed to upload image to AWS S3.', 502);
  }

  logger.info('Image uploaded to S3 successfully', {
    event: 'aws.s3.upload.succeeded',
    bucket: awsConfig.s3Bucket,
    key,
    contentType: file.mimetype,
    size: file.size,
  });

  return {
    bucket: awsConfig.s3Bucket,
    key,
    url: buildObjectUrl(key),
  };
};

module.exports = {
  uploadImageToS3,
  isS3Configured,
};

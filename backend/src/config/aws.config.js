const { env } = require('./env');

const awsConfig = {
  region: env.awsRegion,
  accessKeyId: env.awsAccessKeyId,
  secretAccessKey: env.awsSecretAccessKey,
  s3Bucket: env.awsS3Bucket,
  s3Prefix: env.awsS3Prefix,
  s3PublicBaseUrl: env.awsS3PublicBaseUrl,
};

const hasPlaceholder = (value) => {
  return typeof value === 'string' && value.includes('<') && value.includes('>');
};

const hasUsableValue = (value) => {
  return Boolean(value) && !hasPlaceholder(value);
};

const isS3Configured = () => {
  return Boolean(
    hasUsableValue(awsConfig.region) &&
      hasUsableValue(awsConfig.accessKeyId) &&
      hasUsableValue(awsConfig.secretAccessKey) &&
      hasUsableValue(awsConfig.s3Bucket)
  );
};

const getAwsDiagnostics = () => {
  return {
    configured: isS3Configured(),
    region: awsConfig.region || null,
    bucket: awsConfig.s3Bucket || null,
    prefix: awsConfig.s3Prefix || null,
    accessKeyConfigured: hasUsableValue(awsConfig.accessKeyId),
    secretConfigured: hasUsableValue(awsConfig.secretAccessKey),
  };
};

module.exports = {
  awsConfig,
  isS3Configured,
  getAwsDiagnostics,
};

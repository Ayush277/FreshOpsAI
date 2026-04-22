const {
  clarifaiConfig,
  isClarifaiConfigured,
} = require('../config/clarifai.config');
const { logger } = require('../utils/logger');

const extractTopConcept = (responseJson) => {
  const outputs = responseJson?.outputs || [];
  const firstOutput = outputs[0];
  const concepts = firstOutput?.data?.concepts || [];

  if (!concepts.length) {
    return null;
  }

  const sortedConcepts = [...concepts].sort((a, b) => (b.value || 0) - (a.value || 0));
  const topConcept = sortedConcepts[0];

  return {
    label: topConcept?.name || null,
    confidence: topConcept?.value || null,
  };
};

const buildClarifaiInput = async ({ imageUrl, fileBuffer }) => {
  if (fileBuffer) {
    return {
      data: {
        image: {
          base64: fileBuffer.toString('base64'),
        },
      },
    };
  }

  if (imageUrl) {
    return {
      data: {
        image: {
          url: imageUrl,
        },
      },
    };
  }

  return null;
};

const detectFoodLabel = async ({ imageUrl, fileBuffer }) => {
  if (!isClarifaiConfigured()) {
    logger.warn('Clarifai detection skipped: configuration missing', {
      event: 'clarifai.detection.skipped.config-missing',
      configured: false,
    });

    return {
      success: false,
      skipped: true,
      reason: 'Clarifai is not configured. Set CLARIFAI_PAT, CLARIFAI_USER_ID, CLARIFAI_APP_ID, CLARIFAI_MODEL_ID.',
    };
  }

  try {
    const input = await buildClarifaiInput({ imageUrl, fileBuffer });

    if (!input) {
      logger.warn('Clarifai detection skipped: no image source', {
        event: 'clarifai.detection.skipped.no-image-source',
      });

      return {
        success: false,
        skipped: true,
        reason: 'No image source provided for Clarifai detection.',
      };
    }

    const response = await fetch(`${clarifaiConfig.apiBaseUrl}/${clarifaiConfig.modelId}/outputs`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${clarifaiConfig.pat}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_app_id: {
          user_id: clarifaiConfig.userId,
          app_id: clarifaiConfig.appId,
        },
        inputs: [input],
      }),
    });

    if (!response.ok) {
      const apiError = await response.text();

      logger.warn('Clarifai request failed', {
        event: 'clarifai.detection.failed.response',
        statusCode: response.status,
      });

      return {
        success: false,
        skipped: false,
        reason: `Clarifai request failed with status ${response.status}`,
        details: apiError.slice(0, 300),
      };
    }

    const responseJson = await response.json();
    const topConcept = extractTopConcept(responseJson);

    if (!topConcept?.label) {
      logger.warn('Clarifai did not return a detectable concept', {
        event: 'clarifai.detection.failed.no-concept',
      });

      return {
        success: false,
        skipped: false,
        reason: 'Clarifai did not return a detectable food label.',
      };
    }

    logger.info('Clarifai detection succeeded', {
      event: 'clarifai.detection.succeeded',
      label: topConcept.label,
      confidence: topConcept.confidence,
    });

    return {
      success: true,
      provider: 'clarifai',
      label: topConcept.label,
      confidence: topConcept.confidence,
    };
  } catch (error) {
    logger.error('Clarifai detection failed unexpectedly', {
      event: 'clarifai.detection.failed.unexpected',
      error: error.message,
    });

    return {
      success: false,
      skipped: false,
      reason: 'Clarifai detection failed unexpectedly.',
      details: error.message,
    };
  }
};

module.exports = {
  detectFoodLabel,
};

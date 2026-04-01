const fs = require('fs/promises');
const { env } = require('../config/env');

const CLARIFAI_API_BASE_URL = 'https://api.clarifai.com/v2/models';

const isClarifaiConfigured = () => {
  return Boolean(env.clarifaiPat && env.clarifaiUserId && env.clarifaiAppId && env.clarifaiModelId);
};

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

const buildClarifaiInput = async ({ imageUrl, filePath }) => {
  if (filePath) {
    const fileBuffer = await fs.readFile(filePath);
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

const detectFoodLabel = async ({ imageUrl, filePath }) => {
  if (!isClarifaiConfigured()) {
    return {
      success: false,
      skipped: true,
      reason: 'Clarifai is not configured. Set CLARIFAI_PAT, CLARIFAI_USER_ID, CLARIFAI_APP_ID, CLARIFAI_MODEL_ID.',
    };
  }

  try {
    const input = await buildClarifaiInput({ imageUrl, filePath });

    if (!input) {
      return {
        success: false,
        skipped: true,
        reason: 'No image source provided for Clarifai detection.',
      };
    }

    const response = await fetch(`${CLARIFAI_API_BASE_URL}/${env.clarifaiModelId}/outputs`, {
      method: 'POST',
      headers: {
        Authorization: `Key ${env.clarifaiPat}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_app_id: {
          user_id: env.clarifaiUserId,
          app_id: env.clarifaiAppId,
        },
        inputs: [input],
      }),
    });

    if (!response.ok) {
      const apiError = await response.text();
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
      return {
        success: false,
        skipped: false,
        reason: 'Clarifai did not return a detectable food label.',
      };
    }

    return {
      success: true,
      provider: 'clarifai',
      label: topConcept.label,
      confidence: topConcept.confidence,
    };
  } catch (error) {
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

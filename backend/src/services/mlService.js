const axios = require('axios');
const fs = require('fs');
const config = require('../config/env');
const AppError = require('../utils/AppError');

/** Sends an image to the FastAPI service and maps failures to user-safe API errors. */
async function predict({ filePath, originalName, mimeType }) {
  const buffer = await fs.promises.readFile(filePath);
  const form = new FormData();
  form.append('file', new Blob([buffer], { type: mimeType }), originalName);

  try {
    const { data } = await axios.post(`${config.mlServiceUrl}/predict`, form, { timeout: config.mlTimeoutMs });
    return data;
  } catch (err) {
    const status = err.response && err.response.status;
    if (status === 400 || status === 413) {
      throw new AppError(422, 'INVALID_IMAGE', 'The image could not be read. Try a clear JPG or PNG photo of a single leaf.');
    }
    if (status === 503) {
      throw new AppError(503, 'MODEL_UNAVAILABLE', 'The prediction model is not available right now. Please try again later.');
    }
    if (err.response) {
      throw new AppError(502, 'PREDICTION_FAILED', 'The analysis failed. Please try again.');
    }
    throw new AppError(503, 'ML_SERVICE_UNAVAILABLE', 'The analysis service is unreachable. Please try again in a moment.');
  }
}

/** Never throws: returns null when the ML service cannot be reached. */
async function health() {
  try {
    const { data } = await axios.get(`${config.mlServiceUrl}/health`, { timeout: 2000 });
    return data;
  } catch {
    return null;
  }
}

module.exports = { predict, health };

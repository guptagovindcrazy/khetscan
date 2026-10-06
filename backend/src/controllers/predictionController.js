const fs = require('fs');
const path = require('path');
const config = require('../config/env');
const store = require('../services/predictionStore');
const mlService = require('../services/mlService');
const { parseListQuery } = require('../services/listQuery');
const AppError = require('../utils/AppError');
const { detectImageType, sanitizeFileName, removeFile } = require('../utils/fileUtils');

const ok = (res, data, status = 200, extra = {}) => res.status(status).json({ success: true, data, ...extra });

async function create(req, res) {
  if (!req.file) throw new AppError(400, 'NO_FILE', 'Please attach an image in the "image" field.');
  const { path: filePath, filename, mimetype, originalname } = req.file;

  try {
    const header = Buffer.alloc(8);
    const fd = await fs.promises.open(filePath, 'r');
    try { await fd.read(header, 0, 8, 0); } finally { await fd.close(); }
    if (detectImageType(header) !== mimetype) {
      throw new AppError(422, 'INVALID_IMAGE', 'That file does not look like a real JPG or PNG image.');
    }

    const result = await mlService.predict({ filePath, originalName: filename, mimeType: mimetype });
    const prediction = await store.create({
      imageUrl: `/uploads/${filename}`,
      originalFileName: sanitizeFileName(originalname),
      cropName: result.crop,
      predictedDisease: result.disease,
      confidence: result.confidence,
      status: result.status,
      topPredictions: result.top_predictions,
      symptoms: result.symptoms,
      treatment: result.treatment,
      prevention: result.prevention,
      simulated: Boolean(result.simulated),
      modelMode: result.model_mode,
    });
    return ok(res, prediction, 201);
  } catch (err) {
    await removeFile(filePath);
    throw err;
  }
}

async function list(req, res) {
  const params = parseListQuery(req.query);
  const { items, total } = await store.list(params);
  return ok(res, items, 200, {
    pagination: { page: params.page, limit: params.limit, total, totalPages: Math.max(1, Math.ceil(total / params.limit)) },
  });
}

async function stats(_req, res) {
  return ok(res, await store.stats());
}

async function getOne(req, res) {
  const prediction = await store.findById(req.params.id);
  if (!prediction) throw new AppError(404, 'PREDICTION_NOT_FOUND', 'We could not find that prediction. It may have been deleted.');
  return ok(res, prediction);
}

async function remove(req, res) {
  const prediction = await store.remove(req.params.id);
  if (!prediction) throw new AppError(404, 'PREDICTION_NOT_FOUND', 'We could not find that prediction. It may have been deleted.');
  await removeFile(path.join(config.uploadDir, path.basename(prediction.imageUrl)));
  return ok(res, { id: prediction.id });
}

module.exports = { create, list, stats, getOne, remove };

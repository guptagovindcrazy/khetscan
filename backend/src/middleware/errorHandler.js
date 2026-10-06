const multer = require('multer');
const config = require('../config/env');
const AppError = require('../utils/AppError');

const notFound = (req, _res, next) => next(new AppError(404, 'NOT_FOUND', `Route ${req.method} ${req.path} was not found.`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let { status, code, message } = err;

  if (err instanceof multer.MulterError) {
    status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    code = err.code === 'LIMIT_FILE_SIZE' ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR';
    message = err.code === 'LIMIT_FILE_SIZE'
      ? `Image is too large. The maximum size is ${config.maxFileMb} MB.`
      : 'The upload was not accepted. Send a single image in the "image" field.';
  } else if (err.type === 'entity.parse.failed') {
    status = 400; code = 'BAD_REQUEST'; message = 'The request body could not be parsed.';
  } else if (!err.expose) {
    console.error(err);
    status = 500; code = 'INTERNAL_ERROR'; message = 'Something went wrong on our side. Please try again.';
  }

  res.status(status).json({ success: false, error: { code, message } });
};

module.exports = { notFound, errorHandler };

const crypto = require('crypto');
const fs = require('fs');
const multer = require('multer');
const config = require('../config/env');
const AppError = require('../utils/AppError');
const { MIME_EXT } = require('../utils/fileUtils');

fs.mkdirSync(config.uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, config.uploadDir),
  // Server-generated name: the client-supplied name never touches the filesystem.
  filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${MIME_EXT[file.mimetype]}`),
});

const uploader = multer({
  storage,
  limits: { fileSize: config.maxFileMb * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!MIME_EXT[file.mimetype]) {
      return cb(new AppError(415, 'UNSUPPORTED_FILE_TYPE', 'Only JPG and PNG images are supported.'));
    }
    cb(null, true);
  },
});

module.exports = uploader.single('image');

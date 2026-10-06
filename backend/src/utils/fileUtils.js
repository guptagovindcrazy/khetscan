const fs = require('fs');
const path = require('path');

const MIME_EXT = { 'image/jpeg': '.jpg', 'image/png': '.png' };

/** Checks the file's leading bytes, since the client-supplied MIME type can be spoofed. */
function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg';
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (buffer.length >= 8 && png.every((b, i) => buffer[i] === b)) return 'image/png';
  return null;
}

/** Display-safe original filename: no path parts, control characters or excessive length. */
function sanitizeFileName(name = 'upload') {
  const base = path.basename(String(name)).replace(/[^\w.\- ()]/g, '_').trim();
  return (base || 'upload').slice(0, 120);
}

async function removeFile(filePath) {
  try {
    await fs.promises.unlink(filePath);
  } catch (err) {
    if (err.code !== 'ENOENT') console.error('Could not remove file:', err.code);
  }
}

module.exports = { MIME_EXT, detectImageType, sanitizeFileName, removeFile };

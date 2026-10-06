export const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
export const MAX_FILE_MB = 10;

export function validateImageFile(file) {
  if (!file) return 'Choose an image to analyze.';
  if (!ACCEPTED_TYPES.includes(file.type)) return 'Only JPG and PNG images are supported.';
  if (file.size > MAX_FILE_MB * 1024 * 1024) return `That image is larger than ${MAX_FILE_MB} MB. Choose a smaller one.`;
  if (file.size === 0) return 'That file is empty.';
  return null;
}

export const formatBytes = (n) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

export const formatDate = (iso) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (iso) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });

export const confidenceLabel = (c) => (c >= 85 ? 'High confidence' : c >= 60 ? 'Moderate confidence' : 'Low confidence');

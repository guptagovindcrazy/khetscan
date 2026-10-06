import { useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { formatBytes } from '../utils/format';

export default function ImagePreview({ file, onRemove, disabled }) {
  const url = useMemo(() => URL.createObjectURL(file), [file]);
  useEffect(() => () => URL.revokeObjectURL(url), [url]);

  return (
    <figure className="relative overflow-hidden rounded-2xl border border-paddy-100 bg-white">
      <img src={url} alt="Selected leaf preview" className="max-h-96 w-full object-contain bg-cream-deep" />
      <figcaption className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
        <span className="truncate font-medium">{file.name}</span>
        <span className="shrink-0 text-soil-600">{formatBytes(file.size)}</span>
      </figcaption>
      <button
        type="button" onClick={onRemove} disabled={disabled} aria-label="Remove image"
        className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-paddy-900/80 text-cream hover:bg-paddy-900 disabled:opacity-50"
      >
        <X size={18} aria-hidden />
      </button>
    </figure>
  );
}

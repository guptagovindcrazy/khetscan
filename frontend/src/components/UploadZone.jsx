import { useRef, useState } from 'react';
import { ImagePlus } from 'lucide-react';
import { validateImageFile, MAX_FILE_MB } from '../utils/format';

export default function UploadZone({ onFile, disabled = false }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState(null);

  const accept = (file) => {
    const problem = validateImageFile(file);
    setError(problem);
    if (!problem) onFile(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    if (!disabled) accept(e.dataTransfer.files?.[0]);
  };

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); if (!disabled) setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center rounded-2xl border-2 border-dashed px-6 py-14 text-center transition-colors ${
          dragging ? 'border-paddy-500 bg-paddy-50' : 'border-paddy-300 bg-white/60'
        }`}
      >
        <ImagePlus size={40} className="mb-4 text-paddy-500" aria-hidden />
        <p className="text-lg font-bold">Drop a leaf photo here</p>
        <p className="mt-1 text-sm text-soil-600">JPG or PNG, up to {MAX_FILE_MB} MB. One leaf, in good light, works best.</p>
        <button
          type="button" disabled={disabled} onClick={() => inputRef.current?.click()}
          className="mt-6 rounded-full bg-paddy-700 px-5 py-2.5 text-sm font-semibold text-cream hover:bg-paddy-900 disabled:opacity-50"
        >
          Browse images
        </button>
        <input
          ref={inputRef} type="file" accept="image/jpeg,image/png" className="sr-only" data-testid="file-input"
          aria-label="Choose leaf image" disabled={disabled}
          onChange={(e) => { accept(e.target.files?.[0]); e.target.value = ''; }}
        />
      </div>
      {error && <p role="alert" className="mt-3 text-sm font-medium text-rust-700">{error}</p>}
    </div>
  );
}

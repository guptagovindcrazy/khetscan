import { confidenceLabel } from '../utils/format';

export default function ConfidenceMeter({ value, status = 'diseased', compact = false }) {
  const pct = Math.max(0, Math.min(100, value));
  const bar = status === 'healthy' ? 'bg-paddy-500' : 'bg-rust-500';
  return (
    <div>
      <div className="flex items-baseline justify-between gap-3">
        <span className={`font-display font-bold ${compact ? 'text-lg' : 'text-4xl'}`}>{pct.toFixed(1)}%</span>
        {!compact && <span className="text-sm text-soil-600">{confidenceLabel(pct)}</span>}
      </div>
      <div
        role="meter" aria-label="Confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}
        className="mt-2 h-2 overflow-hidden rounded-full bg-cream-deep"
      >
        <div className={`h-full rounded-full transition-all duration-700 ${bar}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

import { AlertTriangle, CheckCircle2 } from 'lucide-react';

export default function DiseaseBadge({ status, className = '' }) {
  const healthy = status === 'healthy';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${
        healthy ? 'bg-paddy-100 text-paddy-700' : 'bg-rust-100 text-rust-700'
      } ${className}`}
    >
      {healthy ? <CheckCircle2 size={16} aria-hidden /> : <AlertTriangle size={16} aria-hidden />}
      {healthy ? 'Healthy' : 'Disease detected'}
    </span>
  );
}

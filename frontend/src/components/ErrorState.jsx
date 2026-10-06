import { AlertOctagon } from 'lucide-react';
import Button from './Button';

export default function ErrorState({ title = 'Something went wrong', message, onRetry, action }) {
  return (
    <div role="alert" className="flex flex-col items-center rounded-2xl border border-rust-100 bg-rust-100/40 px-6 py-12 text-center">
      <AlertOctagon size={34} className="mb-3 text-rust-500" aria-hidden />
      <h3 className="text-xl font-bold">{title}</h3>
      {message && <p className="mt-2 max-w-md text-soil-600">{message}</p>}
      <div className="mt-6 flex gap-3">
        {onRetry && <Button onClick={onRetry}>Try again</Button>}
        {action}
      </div>
    </div>
  );
}

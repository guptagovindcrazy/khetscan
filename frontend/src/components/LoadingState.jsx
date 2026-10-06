import { Check, Leaf } from 'lucide-react';

export const ANALYSIS_STEPS = [
  'Uploading image',
  'Processing image',
  'Analyzing plant',
  'Running AI model',
  'Preparing diagnosis',
];

export default function LoadingState({ activeStep = 0, steps = ANALYSIS_STEPS, label = 'Analyzing your leaf' }) {
  return (
    <div role="status" aria-live="polite" className="rounded-2xl border border-paddy-100 bg-white/80 p-8">
      <div className="flex items-center gap-3">
        <Leaf className="animate-pulseDot text-paddy-500" aria-hidden />
        <h3 className="text-xl font-bold">{label}</h3>
      </div>
      <ol className="mt-6 space-y-3">
        {steps.map((step, i) => {
          const done = i < activeStep;
          const active = i === activeStep;
          return (
            <li key={step} className={`flex items-center gap-3 text-sm ${done || active ? 'text-paddy-900' : 'text-soil-400'}`}>
              <span className={`grid h-6 w-6 place-items-center rounded-full border ${done ? 'border-paddy-500 bg-paddy-500 text-white' : active ? 'border-paddy-500' : 'border-paddy-100'}`}>
                {done ? <Check size={14} aria-hidden /> : active ? <span className="h-2 w-2 animate-pulseDot rounded-full bg-paddy-500" /> : null}
              </span>
              <span className={active ? 'font-semibold' : ''}>{step}{active ? '…' : ''}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

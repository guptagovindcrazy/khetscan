import { Calendar, FlaskConical, ShieldCheck, Stethoscope } from 'lucide-react';
import Card from './Card';
import ConfidenceMeter from './ConfidenceMeter';
import DiseaseBadge from './DiseaseBadge';
import { formatDateTime } from '../utils/format';

const List = ({ items }) => (
  <ul className="mt-2 space-y-2">
    {items.map((item) => (
      <li key={item} className="flex gap-2 text-sm leading-relaxed text-paddy-900"><span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-paddy-500" />{item}</li>
    ))}
  </ul>
);

export default function PredictionCard({ prediction }) {
  const p = prediction;
  return (
    <article className="space-y-5">
      <Card className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <img src={p.imageUrl} alt={`Uploaded ${p.cropName} leaf`} className="h-64 w-full rounded-xl bg-cream-deep object-cover md:h-full md:min-h-72" />
        <div className="flex flex-col justify-between gap-6">
          <div>
            <p className="text-lg text-soil-600">{p.cropName}</p>
            <h2 className="text-3xl font-bold sm:text-4xl">{p.predictedDisease}</h2>
            <DiseaseBadge status={p.status} className="mt-3" />
          </div>
          <ConfidenceMeter value={p.confidence} status={p.status} />
          <p className="flex items-center gap-2 text-sm text-soil-600"><Calendar size={16} aria-hidden />Analyzed {formatDateTime(p.createdAt)}</p>
        </div>
      </Card>

      {p.simulated && (
        <p role="note" className="rounded-xl bg-turmeric-300/30 px-4 py-3 text-sm">
          <strong>Demo result.</strong> The AI model is not connected, so this diagnosis is simulated and must not be used to treat a crop.
        </p>
      )}

      {p.topPredictions?.length > 1 && (
        <Card>
          <h3 className="text-xl font-bold">Other possibilities</h3>
          <ul className="mt-4 space-y-3">
            {p.topPredictions.map((t, i) => (
              <li key={`${t.crop}-${t.disease}`} className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1">
                <span className={`text-sm ${i === 0 ? 'font-semibold' : ''}`}>{t.crop}: {t.disease}</span>
                <span className="text-sm tabular-nums text-soil-600">{t.confidence.toFixed(1)}%</span>
                <div className="col-span-2 h-1.5 overflow-hidden rounded-full bg-cream-deep">
                  <div className={`h-full rounded-full ${i === 0 ? 'bg-paddy-500' : 'bg-paddy-300'}`} style={{ width: `${t.confidence}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
          <h3 className="flex items-center gap-2 text-xl font-bold"><FlaskConical size={20} className="text-paddy-500" aria-hidden />Symptoms</h3>
          <p className="mt-2 text-sm leading-relaxed">{p.symptoms || 'No symptom information available.'}</p>
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 text-xl font-bold"><Stethoscope size={20} className="text-paddy-500" aria-hidden />Recommended treatment</h3>
          <List items={p.treatment} />
        </Card>
        <Card>
          <h3 className="flex items-center gap-2 text-xl font-bold"><ShieldCheck size={20} className="text-paddy-500" aria-hidden />Prevention</h3>
          <List items={p.prevention} />
        </Card>
      </div>
      <p className="text-xs text-soil-600">
        This is decision support, not a lab diagnosis. Confirm with your local agricultural extension officer or Krishi Vigyan Kendra before spraying.
      </p>
    </article>
  );
}

import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ScanSearch } from 'lucide-react';
import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import ImagePreview from '../components/ImagePreview';
import LoadingState, { ANALYSIS_STEPS } from '../components/LoadingState';
import PredictionCard from '../components/PredictionCard';
import UploadZone from '../components/UploadZone';
import { createPrediction } from '../services/api';

const STEP_MS = 900;
const MODEL_STEP = 3;

export default function Detect() {
  const [file, setFile] = useState(null);
  const [phase, setPhase] = useState('idle'); // idle | analyzing | done | error
  const [step, setStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearInterval(timer.current), []);

  const reset = () => { setFile(null); setResult(null); setError(null); setPhase('idle'); };

  const analyze = async () => {
    setPhase('analyzing');
    setError(null);
    setStep(0);
    // Steps advance on a timer but wait at "Running AI model" until the server answers.
    timer.current = setInterval(() => setStep((s) => Math.min(s + 1, MODEL_STEP)), STEP_MS);
    try {
      const prediction = await createPrediction(file);
      clearInterval(timer.current);
      setStep(ANALYSIS_STEPS.length - 1);
      await new Promise((r) => setTimeout(r, 500));
      setResult(prediction);
      setPhase('done');
    } catch (err) {
      clearInterval(timer.current);
      setError(err.message);
      setPhase('error');
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-4xl font-bold sm:text-5xl">Scan a leaf</h1>
      <p className="mt-3 max-w-xl text-soil-600">Upload a clear photo of one leaf. We will name the likely disease and suggest what to do next.</p>

      <div className="mt-8">
        {phase === 'done' && result ? (
          <div className="space-y-6">
            <PredictionCard prediction={result} />
            <div className="flex flex-wrap gap-3">
              <Button onClick={reset}>Scan another leaf</Button>
              <Button variant="secondary" to={`/history/${result.id}`}>Open saved result</Button>
            </div>
          </div>
        ) : phase === 'analyzing' ? (
          <div className="grid gap-6 md:grid-cols-2">
            <ImagePreview file={file} disabled onRemove={() => {}} />
            <LoadingState activeStep={step} />
          </div>
        ) : (
          <div className="space-y-5">
            {phase === 'error' && (
              <ErrorState title="We could not analyze that image" message={error} onRetry={file ? analyze : reset}
                action={<Button variant="secondary" onClick={reset}>Choose a different image</Button>} />
            )}
            {phase !== 'error' && (file ? <ImagePreview file={file} onRemove={reset} /> : <UploadZone onFile={setFile} />)}
            {file && phase !== 'error' && (
              <Button size="lg" onClick={analyze}><ScanSearch size={20} aria-hidden />Analyze leaf</Button>
            )}
            <p className="text-sm text-soil-600">Past scans are saved in <Link to="/history" className="font-semibold text-paddy-700 underline">your history</Link>.</p>
          </div>
        )}
      </div>
    </section>
  );
}

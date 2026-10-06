import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2 } from 'lucide-react';
import Button from '../components/Button';
import ErrorState from '../components/ErrorState';
import PredictionCard from '../components/PredictionCard';
import { deletePrediction, getPrediction } from '../services/api';

export default function PredictionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);
  const [confirming, setConfirming] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setPrediction(await getPrediction(id));
    } catch (err) {
      setError(err);
    }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  const remove = async () => {
    try {
      await deletePrediction(id);
      navigate('/history');
    } catch (err) {
      setError(err);
    }
  };

  const missing = error && ['INVALID_ID', 'PREDICTION_NOT_FOUND'].includes(error.code);

  return (
    <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <Link to="/history" className="inline-flex items-center gap-2 text-sm font-semibold text-paddy-700 hover:underline"><ArrowLeft size={16} aria-hidden />Back to history</Link>
      <div className="mt-6">
        {error ? (
          <ErrorState
            title={missing ? 'Scan not found' : 'Could not load this scan'}
            message={error.message}
            onRetry={missing ? undefined : load}
            action={<Button variant="secondary" to="/history">Go to history</Button>}
          />
        ) : !prediction ? (
          <p role="status" className="py-16 text-center text-soil-600">Loading scan…</p>
        ) : (
          <div className="space-y-6">
            <PredictionCard prediction={prediction} />
            <div className="flex flex-wrap gap-3">
              <Button to="/detect">Scan another leaf</Button>
              {confirming ? (
                <>
                  <Button variant="danger" onClick={remove}>Delete this scan</Button>
                  <Button variant="ghost" onClick={() => setConfirming(false)}>Cancel</Button>
                </>
              ) : (
                <Button variant="secondary" onClick={() => setConfirming(true)}><Trash2 size={16} aria-hidden />Delete</Button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

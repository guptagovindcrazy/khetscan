import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PredictionCard from '../components/PredictionCard';

const base = {
  id: 'a'.repeat(24), imageUrl: '/uploads/x.jpg', cropName: 'Tomato', predictedDisease: 'Early Blight',
  confidence: 94.7, status: 'diseased', createdAt: '2026-10-06T10:00:00.000Z', simulated: false,
  topPredictions: [
    { crop: 'Tomato', disease: 'Early Blight', confidence: 94.7, status: 'diseased' },
    { crop: 'Tomato', disease: 'Late Blight', confidence: 3.1, status: 'diseased' },
  ],
  symptoms: 'Dark rings on older leaves.', treatment: ['Remove lower leaves.'], prevention: ['Rotate crops.'],
};

describe('PredictionCard', () => {
  it('shows diagnosis, confidence and advice', () => {
    render(<PredictionCard prediction={base} />);
    expect(screen.getByRole('heading', { name: 'Early Blight' })).toBeInTheDocument();
    expect(screen.getAllByText('94.7%').length).toBeGreaterThan(0);
    expect(screen.getByText('Disease detected')).toBeInTheDocument();
    expect(screen.getByText('Remove lower leaves.')).toBeInTheDocument();
    expect(screen.getByText('Rotate crops.')).toBeInTheDocument();
    expect(screen.queryByText(/demo result/i)).toBeNull();
  });

  it('warns when the result is simulated', () => {
    render(<PredictionCard prediction={{ ...base, simulated: true }} />);
    expect(screen.getByRole('note')).toHaveTextContent(/simulated/i);
  });

  it('shows the healthy badge', () => {
    render(<PredictionCard prediction={{ ...base, status: 'healthy', predictedDisease: 'Healthy' }} />);
    expect(screen.getByText('Healthy', { selector: 'span' })).toBeInTheDocument();
  });
});

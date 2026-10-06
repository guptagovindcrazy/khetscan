import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../services/api', () => ({ listPredictions: vi.fn(), deletePrediction: vi.fn() }));
import { deletePrediction, listPredictions } from '../services/api';
import History from '../pages/History';

const item = {
  id: 'b'.repeat(24), imageUrl: '/uploads/a.jpg', cropName: 'Potato', predictedDisease: 'Late Blight',
  confidence: 88.2, status: 'diseased', createdAt: '2026-10-05T08:00:00.000Z',
};
const page = (items) => ({ items, pagination: { page: 1, limit: 8, total: items.length, totalPages: 1 } });
const renderPage = () => render(<MemoryRouter><History /></MemoryRouter>);

describe('History page', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders scans', async () => {
    listPredictions.mockResolvedValue(page([item]));
    renderPage();
    expect((await screen.findAllByText('Late Blight')).length).toBeGreaterThan(0);
  });

  it('shows an empty state', async () => {
    listPredictions.mockResolvedValue(page([]));
    renderPage();
    expect(await screen.findByText('No scans yet')).toBeInTheDocument();
  });

  it('shows a friendly error and retries', async () => {
    listPredictions.mockRejectedValueOnce(new Error('We could not reach the server.')).mockResolvedValue(page([item]));
    renderPage();
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect((await screen.findAllByText('Late Blight')).length).toBeGreaterThan(0);
  });

  it('deletes after confirmation', async () => {
    listPredictions.mockResolvedValue(page([item]));
    deletePrediction.mockResolvedValue();
    renderPage();
    await screen.findAllByText('Late Blight');
    await userEvent.click(screen.getAllByRole('button', { name: /delete potato late blight/i })[0]);
    await userEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);
    await waitFor(() => expect(deletePrediction).toHaveBeenCalledWith(item.id));
  });
});

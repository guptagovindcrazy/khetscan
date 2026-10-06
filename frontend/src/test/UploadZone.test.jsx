import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import UploadZone from '../components/UploadZone';

const pick = (file) => fireEvent.change(screen.getByTestId('file-input'), { target: { files: [file] } });
const makeFile = (name, type, size = 1024) => {
  const f = new File(['x'], name, { type });
  Object.defineProperty(f, 'size', { value: size });
  return f;
};

describe('UploadZone', () => {
  it('passes a valid image to onFile', () => {
    const onFile = vi.fn();
    render(<UploadZone onFile={onFile} />);
    const file = makeFile('leaf.png', 'image/png');
    pick(file);
    expect(onFile).toHaveBeenCalledWith(file);
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('rejects unsupported types', () => {
    const onFile = vi.fn();
    render(<UploadZone onFile={onFile} />);
    pick(makeFile('leaf.gif', 'image/gif'));
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/only jpg and png/i);
  });

  it('rejects oversized images', () => {
    const onFile = vi.fn();
    render(<UploadZone onFile={onFile} />);
    pick(makeFile('big.jpg', 'image/jpeg', 11 * 1024 * 1024));
    expect(onFile).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/larger than 10 MB/);
  });
});

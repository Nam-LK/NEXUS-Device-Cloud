import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
  it('shows the message and reference, and lets the user retry', () => {
    const onRetry = vi.fn();
    render(<ErrorState error={{ message: 'Backend is down', correlationId: 'ref-1' }} onRetry={onRetry} />);

    expect(screen.getByRole('alert')).toHaveTextContent('Backend is down');
    expect(screen.getByText(/ref-1/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('hides the retry button when no handler is given', () => {
    render(<ErrorState error={{ message: 'Nope' }} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});

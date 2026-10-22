import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignalBars } from './SignalBars';

describe('SignalBars', () => {
  it.each([
    ['ONLINE', 'Online'],
    ['DEGRADED', 'Degraded'],
    ['OFFLINE', 'Offline'],
    ['UNKNOWN', 'Unknown'],
  ] as const)('shows a text label for %s so status is not conveyed by color alone', (status, label) => {
    render(<SignalBars status={status} />);
    expect(screen.getByText(label)).toBeInTheDocument();
  });
});

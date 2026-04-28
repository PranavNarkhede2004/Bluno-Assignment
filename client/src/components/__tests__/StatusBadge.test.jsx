import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import StatusBadge from '../StatusBadge';

describe('StatusBadge Component', () => {
  it('renders Available status correctly', () => {
    render(<StatusBadge status="Available" />);
    const badge = screen.getByText('Available');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-blue-400');
  });

  it('renders Sold status correctly', () => {
    render(<StatusBadge status="Sold" />);
    const badge = screen.getByText('Sold');
    expect(badge).toBeInTheDocument();
    expect(badge.className).toContain('text-emerald-400');
  });
});

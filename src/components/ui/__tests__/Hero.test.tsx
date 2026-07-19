import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/styles/theme';
import { Hero } from '../Hero';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Hero Component', () => {
  it('renders hero title and search CTA correctly', () => {
    renderWithTheme(
      <Hero
        title="Find Local Barbers"
        subtitle="Book studio or mobile house calls on demand"
      />
    );

    expect(screen.getByText('Find Local Barbers')).toBeInTheDocument();
    expect(screen.getByText('Book studio or mobile house calls on demand')).toBeInTheDocument();
  });
});

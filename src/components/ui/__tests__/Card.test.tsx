import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/styles/theme';
import { Card } from '../Card';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('Card Component', () => {
  it('renders card content correctly', () => {
    renderWithTheme(
      <Card>
        <h3>Card Header</h3>
        <p>Card body content</p>
      </Card>
    );

    expect(screen.getByText('Card Header')).toBeInTheDocument();
    expect(screen.getByText('Card body content')).toBeInTheDocument();
  });
});

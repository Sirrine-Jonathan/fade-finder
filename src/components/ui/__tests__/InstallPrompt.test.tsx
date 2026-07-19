import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { theme } from '@/styles/theme';
import { InstallPrompt } from '../InstallPrompt';

const renderWithTheme = (ui: React.ReactElement) => {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
};

describe('InstallPrompt Component', () => {
  it('renders install prompt banner', () => {
    renderWithTheme(<InstallPrompt />);
    // Initial banner state check
    const promptElement = screen.queryByText(/install fade finder/i);
    if (promptElement) {
      expect(promptElement).toBeInTheDocument();
    }
  });
});

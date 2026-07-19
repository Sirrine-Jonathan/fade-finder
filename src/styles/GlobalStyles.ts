'use client';

import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  :root {
    --bg-color: #0b1318;
    --text-color: #f8fafc;
    --surface-bg: #131f26;
    --card-bg: rgba(19, 31, 38, 0.7);
    --border-color: #334155;
    --text-secondary: #94a3b8;
  }

  [data-theme='light'] {
    --bg-color: #f8fafc;
    --text-color: #0f172a;
    --surface-bg: #ffffff;
    --card-bg: #ffffff;
    --border-color: #cbd5e1;
    --text-secondary: #475569;
  }

  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  html, body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
    transition: background-color 0.25s ease, color 0.25s ease;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  button {
    font-family: inherit;
  }

  .glass-panel {
    background: var(--card-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.08);
  }

  [data-theme='light'] .glass-panel {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
`;

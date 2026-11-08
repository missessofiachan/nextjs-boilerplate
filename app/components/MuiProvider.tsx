'use client';

import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Hartwell Eco-Safe Green theme without global CssBaseline reset so prototype CSS variables and layouts stay intact
const hartwellTheme = createTheme({
  palette: {
    primary: {
      main: '#123e2b',
      dark: '#0a2b1d',
      light: '#2f7d4d',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#00796B',
      light: '#e9f4ec',
      contrastText: '#ffffff',
    },
    error: {
      main: '#a7352c',
    },
    success: {
      main: '#1B5E20',
    },
    background: {
      default: '#f7f5ee',
      paper: '#ffffff',
    },
  },
  shape: {
    borderRadius: 10,
  },
  typography: {
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: {
      textTransform: 'none',
      fontWeight: 700,
    },
  },
});

export default function MuiProvider({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={hartwellTheme}>{children}</ThemeProvider>
    </AppRouterCacheProvider>
  );
}

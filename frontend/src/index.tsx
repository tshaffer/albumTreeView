import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppShell from './components/AppShell';
import { store } from './models/store';

// Optional: customize your MUI theme if needed
const theme = createTheme();

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <AppShell />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);

import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import AppShell from './components/AppShell';
import { store } from './redux/store';

const theme = createTheme();

const container = document.getElementById('root');

if (!container) throw new Error('Root container missing in index.html');

const root = ReactDOM.createRoot(container);
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

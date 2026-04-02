import '../errorSuppression'; // MUST BE FIRST - Error suppression
import '../styles/fonts.css';
import '../styles/scrollbar.css';
import React from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { ThemeProvider } from 'next-themes';
import { ErrorBoundary } from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
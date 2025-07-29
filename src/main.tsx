import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary';
import './index.css';
import { ThemeProvider } from "@/components/ThemeProvider";
import { SettingsProvider } from "@/context/SettingsContext";
import { Toaster } from "@/components/ui/toaster";

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <SettingsProvider>
          <App />
        </SettingsProvider>
        <Toaster />
      </ThemeProvider>
    </ErrorBoundary>
  </BrowserRouter>
);

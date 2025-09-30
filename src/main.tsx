import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './styles/react-flow-export.css';
import './styles/reactflow-edge-label-export-fix.css';
import App from './App';
import { initializeSentry } from '@/lib/monitoring/initializeSentry';
import { OptimizedDemoDataService } from '@/services/demo/OptimizedDemoDataService';

// Initialize enhanced Sentry monitoring and error reporting
initializeSentry({
  enableUserFeedback: true,
  enablePerformanceMonitoring: true,
  sampleRate: 1.0,
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0
}).then((initialized) => {
  if (initialized) {
    console.log('🔍 Enhanced monitoring and error recovery system enabled');
  } else {
    console.log('🔍 Monitoring disabled (development mode)');
  }
});

// Pre-warm demo data in background (non-blocking)
// This runs after a delay to not impact initial page load
OptimizedDemoDataService.prewarmDemoData();

// Runtime cache control for SPA navigation
const configureCacheHeaders = () => {
  // Add meta tag for proper cache control
  const metaTag = document.createElement('meta');
  metaTag.httpEquiv = 'Cache-Control';
  metaTag.content = 'no-cache, no-store, must-revalidate';
  document.head.appendChild(metaTag);

  // Force asset revalidation on navigation
  if ('serviceWorker' in navigator) {
    window.addEventListener('beforeunload', () => {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.update());
      });
    });
  }

  // Handle client-side routing cache issues
  window.addEventListener('popstate', () => {
    // Force revalidation of cached resources
    if (window.performance && window.performance.navigation) {
      if (window.performance.navigation.type === 2) {
        window.location.reload(true);
      }
    }
  });
};

// This script handles GitHub Pages SPA routing issues
// It's based on https://github.com/rafgraph/spa-github-pages
const redirectFromGitHubPages = () => {
  // Check if we're on GitHub Pages and have a redirect in the URL query
  if (
    window.location.hostname.includes('github.io') &&
    window.location.search &&
    window.location.search.includes('?/')
  ) {
    const redirectPath = window.location.search
      .replace('?/', '')  // Remove the ?/ prefix
      .replace(/~and~/g, '&'); // Replace encoded ampersands
    
    // Create the correct path and redirect
    const newPath = window.location.pathname + redirectPath + window.location.hash;
    window.history.replaceState(null, '', newPath);
  }

  // Handle root path special case for GitHub Pages
  if (
    window.location.hostname.includes('github.io') && 
    window.location.pathname === '/audit-readiness-hub/' &&
    !window.location.search
  ) {
    console.log('GitHub Pages root path detected, ensuring proper routing');
  }
};

// Run this before rendering the app
configureCacheHeaders();
redirectFromGitHubPages();

// Find the root element
const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('Root element not found');
} else {
  // Render the app
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

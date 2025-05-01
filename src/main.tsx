import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

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
redirectFromGitHubPages();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

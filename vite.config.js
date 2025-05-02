import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isProduction = command === 'build';
  
  return {
    plugins: [
      react(),
      {
        name: 'generate-github-pages-files',
        closeBundle() {
          if (isProduction) {
            try {
              // Copy index.html to 404.html for GitHub Pages SPA routing
              fs.copyFileSync('./dist/index.html', './dist/404.html');
              
              // Create .nojekyll file to disable Jekyll processing
              fs.writeFileSync('./dist/.nojekyll', '');
              
              // Create _redirects file for Netlify (if used)
              fs.writeFileSync('./dist/_redirects', '/* /index.html 200');
              
              console.log('✅ GitHub Pages files generated successfully!');
            } catch (error) {
              console.error('❌ Error generating GitHub Pages files:', error);
            }
          }
        }
      }
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    // Use different base path for development and production
    base: isProduction ? './' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Add source maps for better debugging
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    server: {
      port: 3001,
      open: true, // Auto-open browser
      host: true, // Listen on all addresses
    }
  }
}) 
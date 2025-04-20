import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const base = isDev ? '/' : '/audit-readiness-hub/';
  
  return {
    plugins: [
      react(),
      {
        name: 'generate-404-html',
        closeBundle() {
          if (command === 'build') {
            // Copy index.html to 404.html for GitHub Pages SPA routing
            const indexHtml = fs.readFileSync('./dist/index.html', 'utf-8');
            fs.writeFileSync('./dist/404.html', indexHtml);
          }
        }
      }
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: base,
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
    }
  }
}) 
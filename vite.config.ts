import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
      react(),
      // Generate base HTML with absolute paths for GitHub Pages
      {
        name: 'html-transform',
        transformIndexHtml(html) {
          return html.replace(
            /(href|src)="\/audit-readiness-hub\//g, 
            '$1="https://seriouz85.github.io/audit-readiness-hub/'
          );
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: '/audit-readiness-hub/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          }
        },
      },
    },
    server: {
      port: 8080,
      strictPort: true,
    },
    publicDir: 'public',
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.ico']
});

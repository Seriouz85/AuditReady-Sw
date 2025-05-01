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
      outDir: './',
      emptyOutDir: false,
      assetsDir: 'assets',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
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

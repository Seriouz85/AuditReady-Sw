import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
      react(),
    ],
    optimizeDeps: {
      exclude: [
        'mermaid',
        '@mermaid-js/mermaid',
        'quadrantDiagram-120e2f19',
        'cytoscape',
        'cytoscape-cose-bilkent',
        'cytoscape-fcose',
        'd3',
        'dagre-d3',
        'elkjs'
      ],
      include: [
        'react',
        'react-dom',
        'react-router-dom'
      ]
    },
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

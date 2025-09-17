import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { readFileSync } from 'fs';

// Load version info
let versionInfo = {
  version: '1.1.0',
  buildDate: new Date().toISOString(),
  commitSha: 'development',
  branch: 'main'
};

try {
  const versionFile = readFileSync('./src/version.json', 'utf8');
  versionInfo = JSON.parse(versionFile);
} catch (e) {
  console.log('Using default version info');
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
    base: mode === 'github' ? '/audit-readiness-hub/' : '/',
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      assetsDir: 'assets',
      sourcemap: true,
      minify: 'terser',
      rollupOptions: {
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          }
        },
      },
    },
    server: {
      port: 3000,
      strictPort: false,
      host: 'localhost'
    },
    publicDir: 'public',
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.ico'],
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(versionInfo.version),
      'import.meta.env.VITE_BUILD_DATE': JSON.stringify(versionInfo.buildDate),
      'import.meta.env.VITE_COMMIT_SHA': JSON.stringify(versionInfo.commitSha),
      'import.meta.env.VITE_BRANCH': JSON.stringify(versionInfo.branch),
    },
}));

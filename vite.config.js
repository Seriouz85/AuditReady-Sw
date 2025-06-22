import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = command === 'build';
  // Check if we're building for GitHub Pages or Vercel
  const isGitHubPages = mode === 'github' || process.env.GITHUB_PAGES === 'true';
  
  return {
    plugins: [
      react(),
      {
        name: 'generate-github-pages-files',
        closeBundle() {
          if (isProduction) {
            try {
              // Copy index.html to 404.html for GitHub Pages SPA routing
              if (fs.existsSync('dist/index.html')) {
                fs.copyFileSync('dist/index.html', 'dist/404.html');
                console.log('✅ Generated 404.html for GitHub Pages routing');
              }
              
              // Generate _redirects file for Netlify/Vercel
              const redirectsContent = '/*    /index.html   200';
              fs.writeFileSync('dist/_redirects', redirectsContent);
              console.log('✅ Generated _redirects file');
              
              // Generate .nojekyll for GitHub Pages
              fs.writeFileSync('dist/.nojekyll', '');
              console.log('✅ Generated .nojekyll file');
              
            } catch (error) {
              console.warn('⚠️ Warning: Could not generate deployment files:', error.message);
            }
          }
        }
      }
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
    base: isGitHubPages ? '/audit-readiness-hub/' : '/',
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
      port: 8080,
      strictPort: true,
    },
    publicDir: 'public',
    assetsInclude: ['**/*.svg', '**/*.png', '**/*.jpg', '**/*.jpeg', '**/*.gif', '**/*.ico']
  }
})
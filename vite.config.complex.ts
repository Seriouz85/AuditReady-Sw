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
        'elkjs',
        'monaco-editor', // Large code editor - lazy load
        '@monaco-editor/react'
      ],
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'zustand',
        '@tanstack/react-query',
        'lucide-react' // Frequently used icons
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
      chunkSizeWarningLimit: 800, // Warn at 800KB to catch issues earlier
      target: 'es2020', // Modern browsers for better optimization
      terserOptions: {
        compress: {
          drop_console: true, // Remove console logs in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.warn'], // Remove specific console calls
        },
        mangle: {
          safari10: true, // Safari 10 compatibility
        },
      },
      rollupOptions: {
        treeshake: {
          preset: 'recommended',
          moduleSideEffects: false, // Aggressive tree shaking
        },
        output: {
          entryFileNames: `assets/[name]-[hash].js`,
          chunkFileNames: `assets/[name]-[hash].js`,
          assetFileNames: `assets/[name]-[hash].[ext]`,
          manualChunks: (id) => {
            // Core vendor libraries - frequently used
            if (id.includes('node_modules')) {
              // React ecosystem
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
                return 'vendor-react';
              }
              
              // State management and data fetching
              if (id.includes('@tanstack') || id.includes('zustand') || id.includes('@supabase')) {
                return 'vendor-state';
              }
              
              // Radix UI components (large component library)
              if (id.includes('@radix-ui')) {
                return 'vendor-radix';
              }
              
              // Material UI components
              if (id.includes('@mui') || id.includes('@emotion')) {
                return 'vendor-mui';
              }
              
              // Firebase and Google services
              if (id.includes('firebase') || id.includes('@firebase') || id.includes('@google')) {
                return 'vendor-firebase';
              }
              
              // Monaco Editor (large code editor)
              if (id.includes('monaco') || id.includes('@monaco')) {
                return 'vendor-monaco';
              }
              
              // UI libraries and icons
              if (id.includes('lucide-react') || id.includes('framer-motion') || id.includes('sonner') || id.includes('cmdk')) {
                return 'vendor-ui';
              }
              
              // PDF generation libraries
              if (id.includes('jspdf') || id.includes('pdf') || id.includes('@react-pdf')) {
                return 'vendor-pdf';
              }
              
              // Diagram and visualization libraries
              if (id.includes('reactflow') || id.includes('mermaid') || id.includes('d3') || id.includes('recharts')) {
                return 'vendor-diagrams';
              }
              
              // Document processing libraries
              if (id.includes('docx') || id.includes('exceljs') || id.includes('marked') || id.includes('dompurify')) {
                return 'vendor-documents';
              }
              
              // Image and canvas libraries
              if (id.includes('html2canvas') || id.includes('html-to-image') || id.includes('canvg') || id.includes('qrcode')) {
                return 'vendor-imaging';
              }
              
              // Form and UI utilities
              if (id.includes('react-hook-form') || id.includes('react-day-picker') || id.includes('input-otp') || 
                  id.includes('react-resizable') || id.includes('embla-carousel') || id.includes('vaul')) {
                return 'vendor-forms';
              }
              
              // Network and utilities
              if (id.includes('axios') || id.includes('stripe') || id.includes('date-fns')) {
                return 'vendor-utils';
              }
              
              // Development and testing tools
              if (id.includes('@playwright') || id.includes('@testing-library')) {
                return 'vendor-dev';
              }
              
              // Remaining smaller libraries
              return 'vendor-misc';
            }

            // Split by major feature areas
            if (id.includes('/src/pages/admin/') || id.includes('/src/components/admin/')) {
              return 'feature-admin';
            }
            if (id.includes('/src/pages/LMS/') || id.includes('/src/components/LMS/')) {
              return 'feature-lms';
            }
            if (id.includes('/src/pages/compliance/') || id.includes('/src/components/compliance/')) {
              return 'feature-compliance';
            }
            if (id.includes('/src/pages/auth/') || id.includes('/src/components/auth/')) {
              return 'feature-auth';
            }
            if (id.includes('/src/components/editor/') || id.includes('GraphicalEditor') || id.includes('EnterpriseAREditor')) {
              return 'feature-editor';
            }
            if (id.includes('/src/services/compliance/') || id.includes('ComplianceSimplification')) {
              return 'feature-compliance-engine';
            }
            if (id.includes('/src/services/') && (id.includes('pdf') || id.includes('export'))) {
              return 'feature-exports';
            }
            if (id.includes('/src/services/billing/') || id.includes('/src/services/stripe/')) {
              return 'feature-billing';
            }
            if (id.includes('/src/components/reports/') || id.includes('/src/pages/risk-management/')) {
              return 'feature-reports';
            }
            if (id.includes('/src/components/settings/') || id.includes('/src/pages/Settings')) {
              return 'feature-settings';
            }

            // Services layer
            if (id.includes('/src/services/')) {
              return 'shared-services';
            }

            // UI Components
            if (id.includes('/src/components/ui/') || id.includes('/src/lib/ui-standards')) {
              return 'shared-ui';
            }

            // Everything else goes in main
            return 'main';
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

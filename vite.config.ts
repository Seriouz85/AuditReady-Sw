import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  const isDev = command === 'serve';
  const base = isDev ? '/' : '/audit-readiness-hub/';
  
  return {
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: base,
    server: {
      host: "::",
      port: 8080,
      strictPort: true,
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom'],
    },
  }
});

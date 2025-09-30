import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// MINIMAL VITE CONFIG - NO OPTIMIZATIONS
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    target: 'es2020',
    // NO MANUAL CHUNKS - LET VITE HANDLE IT
  },
  server: {
    port: 3000,
    strictPort: false,
    host: 'localhost'
  }
});
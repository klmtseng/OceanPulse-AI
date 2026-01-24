import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Fix: Property 'cwd' does not exist on type 'Process'.
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      // This is critical to make `process.env.API_KEY` work in the browser code
      // as used in services/geminiService.ts
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});
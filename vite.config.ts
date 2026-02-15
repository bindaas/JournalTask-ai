
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Use a type cast to any for process to avoid the TS error about missing cwd property on the global Process type
  const env = loadEnv(mode, (process as any).cwd(), '');
  return {
    plugins: [react()],
    define: {
      'process.env.API_KEY': JSON.stringify(env.VITE_API_KEY || env.API_KEY),
      'process.env.GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID || env.GOOGLE_CLIENT_ID),
      'process.env.GOOGLE_CLOUD_PROJECT': JSON.stringify(env.VITE_GOOGLE_CLOUD_PROJECT || env.GOOGLE_CLOUD_PROJECT || 'local-dev')
    },
    server: {
      port: 5173,
      strictPort: true,
    }
  };
});

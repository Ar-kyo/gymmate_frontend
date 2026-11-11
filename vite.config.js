import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backend = new URL(env.LAVALUST_URL || 'http://localhost/gynmate/public/');
  const basePath = backend.pathname.replace(/\/+$/, '');

  return {
    plugins: [react()],
    server: {
      host: '127.0.0.1',
      proxy: {
        '/api': {
          target: `${backend.protocol}//${backend.host}`,
          changeOrigin: true,
          rewrite: (path) => `${basePath}${path}`,
        },
      },
    },
  };
});

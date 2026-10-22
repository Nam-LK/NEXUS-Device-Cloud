import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vitest/config';

// Trong môi trường dev, mọi request /api được proxy sang backend nên trình duyệt thấy "cùng origin"
// (cookie session và CSRF hoạt động đơn giản, không cần CORS).
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_API_PROXY_TARGET || 'http://localhost:8080';

  return {
    plugins: [react()],
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': { target: proxyTarget },
      },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      css: false,
    },
  };
});

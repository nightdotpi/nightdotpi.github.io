import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const isDev = mode === 'development';

  const port = Number(env.VITE_PORT || 5173);

  return {
    /**
     * برای GitHub User Page مثل:
     * https://nightdotpi.github.io
     * و همچنین دامنه PiNet:
     * https://nightez2278.pinet.com
     * مقدار base باید '/' باشد.
     */
    base: '/',

    plugins: [react()],

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },

    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,

      rollupOptions: {
        output: {
          entryFileNames: 'assets/[name]-[hash].js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
    },

    server: {
      port,
      host: true,
      open: isDev,
      strictPort: false,

      /**
       * اگر در development خواستی از مسیر نسبی /api استفاده کنی،
       * می‌توانی این proxy را فعال نگه داری.
       * اما چون در env فعلی از Bonto مستقیم استفاده می‌کنی:
       * VITE_API_URL=https://night.bonto.run/api
       * این proxy ضروری نیست.
       */
      proxy: {
        '/api': {
          target: env.VITE_PROXY_API_TARGET || 'https://night.bonto.run',
          changeOrigin: true,
          secure: true,
        },
      },
    },

    preview: {
      port,
      host: true,
      strictPort: false,
    },
  };
});

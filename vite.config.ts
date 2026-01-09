import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Proxy Hugging Face API to avoid CORS issues
          '/api/huggingface': {
            target: 'https://api-inference.huggingface.co',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/huggingface/, ''),
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req: any) => {
                // Forward the Authorization header from the custom header
                const authHeader = req.headers['x-huggingface-token'];
                if (authHeader) {
                  proxyReq.setHeader('Authorization', `Bearer ${authHeader}`);
                  // Remove the custom header so it's not sent to Hugging Face
                  proxyReq.removeHeader('x-huggingface-token');
                }
              });
            }
          },
          // Proxy Replicate API if needed
          '/api/replicate': {
            target: 'https://api.replicate.com',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/replicate/, ''),
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req: any) => {
                const authHeader = req.headers['x-replicate-token'];
                if (authHeader) {
                  proxyReq.setHeader('Authorization', `Token ${authHeader}`);
                  proxyReq.removeHeader('x-replicate-token');
                }
              });
            }
          }
        }
      },
      plugins: [react()],
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY),
        'import.meta.env.VITE_HUGGINGFACE_API_KEY': JSON.stringify(env.VITE_HUGGINGFACE_API_KEY || env.HUGGINGFACE_API_KEY),
        'import.meta.env.VITE_REPLICATE_API_TOKEN': JSON.stringify(env.VITE_REPLICATE_API_TOKEN || env.REPLICATE_API_TOKEN),
        'import.meta.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(env.VITE_GA_MEASUREMENT_ID),
        'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
        'import.meta.env.VITE_GOOGLE_CLIENT_SECRET': JSON.stringify(env.VITE_GOOGLE_CLIENT_SECRET),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

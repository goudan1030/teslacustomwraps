import path from 'path';
import { defineConfig, loadEnv, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    const apiYiKey = env.APIYI_API_KEY || env.VITE_APIYI_API_KEY;
    const normalizeApiYiBaseUrl = (baseUrl?: string) => {
      if (!baseUrl || baseUrl.includes('vip.apiyi.com')) {
        return 'https://api.apiyi.com';
      }

      return baseUrl.replace(/\/+$/, '');
    };

    const apiYiBaseUrl = normalizeApiYiBaseUrl(env.APIYI_BASE_URL);
    const apiYiModel = env.APIYI_MODEL || 'gpt-image-2-all';
    const nanoBananaModel = env.APIYI_NANO_BANANA_MODEL || 'gemini-3.1-flash-image-preview';
    const maxRateLimitRetries = 1;

    const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

    const buildJsonResponse = (res: any, statusCode: number, payload: unknown) => {
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(payload));
    };

    const extractImagePayload = (data: any) => {
      const content = data?.choices?.[0]?.message?.content;

      if (typeof content === 'string' && content.trim()) {
        const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
        const urlMatch = content.match(/(https?:\/\/[^\s)]+)/);
        const imageUrl = markdownMatch?.[1] || urlMatch?.[1] || null;

        if (imageUrl) {
          return { content, imageUrl };
        }
      }

      const imageUrl = data?.data?.[0]?.url || null;
      const b64Json =
        data?.data?.[0]?.b64_json ||
        data?.candidates?.[0]?.content?.parts?.find((part: any) => part?.inlineData?.data)?.inlineData?.data ||
        null;

      if (imageUrl || b64Json) {
        return {
          content: imageUrl || b64Json,
          imageUrl,
          b64_json: b64Json,
        };
      }

      return null;
    };

    const extractErrorMessage = (data: any) => {
      if (typeof data?.error === 'string') return data.error;
      if (typeof data?.error?.message === 'string') return data.error.message;
      if (typeof data?.message === 'string') return data.message;
      return 'APIYI request failed.';
    };

    const isRateLimitError = (status: number, message: string) => {
      return status === 429 || /rate limit|try again/i.test(message);
    };

    const getRetryDelayMs = (response: Response, message: string, attempt: number) => {
      const retryAfter = response.headers.get('retry-after');
      const retryAfterSeconds = retryAfter ? Number.parseFloat(retryAfter) : Number.NaN;

      if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds >= 0) {
        return Math.min(Math.ceil(retryAfterSeconds * 1000), 10_000);
      }

      const messageDelay = message.match(/try again in\s+(\d+)\s*ms/i);
      if (messageDelay) {
        return Math.min(Number.parseInt(messageDelay[1], 10) + 250, 10_000);
      }

      return Math.min(750 * 2 ** attempt, 8_000);
    };

    const readRequestBody = async (req: any) => {
      const chunks: Buffer[] = [];

      for await (const chunk of req) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
      }

      return Buffer.concat(chunks).toString('utf8');
    };

    const parseDataUrl = (dataUrl: string) => {
      const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!match) {
        return {
          mimeType: 'image/png',
          buffer: Buffer.from(dataUrl, 'base64'),
        };
      }

      return {
        mimeType: match[1],
        buffer: Buffer.from(match[2], 'base64'),
      };
    };

    const extractImageEditRequest = (body: any) => {
      if (typeof body?.prompt === 'string' && typeof body?.image === 'string') {
        return {
          model: body.model || apiYiModel,
          prompt: body.prompt,
          image: body.image,
          size: body.size,
        };
      }

      const content = body?.messages?.[0]?.content;
      if (!Array.isArray(content)) return null;

      const prompt = content.find((part: any) => part?.type === 'text')?.text;
      const image = content.find((part: any) => part?.type === 'image_url')?.image_url?.url;

      if (typeof prompt !== 'string' || typeof image !== 'string') return null;

      return {
        model: body.model || apiYiModel,
        prompt,
        image,
        size: body.size,
      };
    };

    const devApiYiMiddleware = (): Plugin => ({
      name: 'dev-apiyi-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          const url = req.url ? new URL(req.url, 'http://localhost') : null;
          const pathname = url?.pathname;
          const isGenerateWrap = pathname === '/api/generate-wrap';
          const isNanoBanana = pathname === '/api/nano-banana-edit';

          if (!isGenerateWrap && !isNanoBanana) {
            next();
            return;
          }

          if (req.method === 'OPTIONS') {
            res.statusCode = 204;
            res.setHeader('Allow', 'OPTIONS, POST');
            res.end();
            return;
          }

          if (req.method !== 'POST') {
            buildJsonResponse(res, 405, { error: 'Method not allowed.' });
            return;
          }

          if (!apiYiKey) {
            buildJsonResponse(res, 500, {
              error: 'APIYI_API_KEY is not configured for local development.',
            });
            return;
          }

          let parsedBody: any;

          try {
            const rawBody = await readRequestBody(req);
            parsedBody = JSON.parse(rawBody || '{}');
          } catch {
            buildJsonResponse(res, 400, { error: 'Request body must be valid JSON.' });
            return;
          }

          const imageEditRequest = !isNanoBanana ? extractImageEditRequest(parsedBody) : null;

          if (isNanoBanana) {
            const hasContents = Array.isArray(parsedBody.contents) && parsedBody.contents.length > 0;
            if (!hasContents) {
              buildJsonResponse(res, 400, { error: 'Missing required field: contents.' });
              return;
            }
          } else if (!imageEditRequest) {
            buildJsonResponse(res, 400, { error: 'Missing required fields: prompt and image.' });
            return;
          }

          try {
            for (let attempt = 0; attempt <= maxRateLimitRetries; attempt += 1) {
              const upstreamUrl = isNanoBanana
                ? `${apiYiBaseUrl}/v1beta/models/${nanoBananaModel}:generateContent`
                : `${apiYiBaseUrl}/v1/images/edits`;

              let upstreamBody: BodyInit;
              let headers: HeadersInit = {
                Accept: 'application/json',
                Authorization: `Bearer ${apiYiKey}`,
              };

              if (isNanoBanana) {
                upstreamBody = JSON.stringify(parsedBody);
                headers = {
                  ...headers,
                  'Content-Type': 'application/json',
                };
              } else {
                const editRequest = imageEditRequest!;
                const { mimeType, buffer } = parseDataUrl(editRequest.image);
                const formData = new FormData();
                formData.append('model', editRequest.model);
                formData.append('prompt', editRequest.prompt);
                formData.append('response_format', 'url');
                formData.append('image[]', new Blob([buffer], { type: mimeType }), 'template.png');
                if (editRequest.size) {
                  formData.append('size', editRequest.size);
                }
                upstreamBody = formData;
              }

              let upstreamResponse: Response;
              let data: any = null;

              try {
                upstreamResponse = await fetch(upstreamUrl, {
                  method: 'POST',
                  headers,
                  body: upstreamBody,
                });

                data = await upstreamResponse.json().catch(() => null);
              } catch (error) {
                const message = error instanceof Error ? error.message : 'Unexpected upstream error.';
                const cause = error instanceof Error && 'cause' in error
                  ? String((error as Error & { cause?: unknown }).cause)
                  : undefined;

                if (attempt < maxRateLimitRetries) {
                  await sleep(Math.min(750 * 2 ** attempt, 8_000));
                  continue;
                }

                buildJsonResponse(res, 502, {
                  error: `Local dev relay failed to reach APIYI: ${message}`,
                  upstreamUrl,
                  cause,
                });
                return;
              }

              if (!upstreamResponse.ok) {
                const upstreamError = extractErrorMessage(data);

                if (attempt < maxRateLimitRetries && isRateLimitError(upstreamResponse.status, upstreamError)) {
                  await sleep(getRetryDelayMs(upstreamResponse, upstreamError, attempt));
                  continue;
                }

                buildJsonResponse(res, upstreamResponse.status, { error: upstreamError, details: data });
                return;
              }

              const imagePayload = extractImagePayload(data);
              if (!imagePayload) {
                buildJsonResponse(res, 502, {
                  error: 'APIYI did not return a usable image payload.',
                  details: data,
                });
                return;
              }

              buildJsonResponse(res, 200, imagePayload);
              return;
            }

            buildJsonResponse(res, 429, { error: 'Rate limit reached. Please try again shortly.' });
          } catch (error) {
            buildJsonResponse(res, 500, {
              error: error instanceof Error ? error.message : 'Unexpected server error.',
            });
          }
        });
      },
    });

    const configureApiYiProxy = (proxy: any) => {
      proxy.on('proxyReq', (proxyReq: any) => {
        proxyReq.setHeader('Connection', 'keep-alive');
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Accept', 'application/json');
        if (apiYiKey) {
          proxyReq.setHeader('Authorization', `Bearer ${apiYiKey}`);
        }
      });
    };

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          // Proxy Hugging Face API to avoid CORS issues
          // Note: Hugging Face now uses router.huggingface.co instead of api-inference.huggingface.co
          '/api/huggingface': {
            target: 'https://router.huggingface.co',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api\/huggingface/, ''),
            configure: (proxy, _options) => {
              proxy.on('proxyReq', (proxyReq, req: any) => {
                // Forward the Authorization header from the custom header
                const authHeader = req.headers['x-huggingface-token'];
                console.log('Proxy: Forwarding Hugging Face request, token present:', !!authHeader);
                if (authHeader) {
                  proxyReq.setHeader('Authorization', `Bearer ${authHeader}`);
                  // Remove the custom header so it's not sent to Hugging Face
                  proxyReq.removeHeader('x-huggingface-token');
                } else {
                  console.error('Proxy: No Hugging Face token found in request headers!');
                }
              });
              proxy.on('error', (err, req, res) => {
                console.error('Proxy error:', err);
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
          },
        },
      },
      plugins: [react(), devApiYiMiddleware()],
      define: {
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY),
        'import.meta.env.VITE_OPENAI_API_KEY': JSON.stringify(env.VITE_OPENAI_API_KEY || env.OPENAI_API_KEY),
        'import.meta.env.VITE_HUGGINGFACE_API_KEY': JSON.stringify(env.VITE_HUGGINGFACE_API_KEY || env.HUGGINGFACE_API_KEY),
        'import.meta.env.VITE_REPLICATE_API_TOKEN': JSON.stringify(env.VITE_REPLICATE_API_TOKEN || env.REPLICATE_API_TOKEN),
        'import.meta.env.VITE_GA_MEASUREMENT_ID': JSON.stringify(env.VITE_GA_MEASUREMENT_ID),
        'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(env.VITE_GOOGLE_CLIENT_ID),
        'import.meta.env.VITE_GOOGLE_CLIENT_SECRET': JSON.stringify(env.VITE_GOOGLE_CLIENT_SECRET),
        'import.meta.env.VITE_APP_ENV': JSON.stringify(env.VITE_APP_ENV || mode),
        'import.meta.env.VITE_APP_BASE_URL': JSON.stringify(env.VITE_APP_BASE_URL),
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});

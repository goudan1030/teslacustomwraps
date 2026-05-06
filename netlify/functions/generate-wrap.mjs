const normalizeApiYiBaseUrl = (baseUrl) => {
  if (!baseUrl || baseUrl.includes('vip.apiyi.com')) {
    return 'https://api.apiyi.com';
  }

  return baseUrl.replace(/\/+$/, '');
};

const APIYI_BASE_URL = normalizeApiYiBaseUrl(process.env.APIYI_BASE_URL);
const APIYI_MODEL = process.env.APIYI_MODEL || 'gpt-image-2-all';
const NANO_BANANA_MODEL = process.env.APIYI_NANO_BANANA_MODEL || 'gemini-3.1-flash-image-preview';
const MAX_RATE_LIMIT_RETRIES = 1;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const buildJsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store',
  },
  body: JSON.stringify(payload),
});

const extractImagePayload = (data) => {
  const content = data?.choices?.[0]?.message?.content;

  if (typeof content === 'string' && content.trim()) {
    const markdownMatch = content.match(/!\[.*?\]\((.*?)\)/);
    const urlMatch = content.match(/(https?:\/\/[^\s)]+)/);
    const imageUrl = markdownMatch?.[1] || urlMatch?.[1] || null;

    if (imageUrl) {
      return {
        content,
        imageUrl,
      };
    }
  }

  const imageUrl = data?.data?.[0]?.url || null;
  const b64Json =
    data?.data?.[0]?.b64_json ||
    data?.candidates?.[0]?.content?.parts?.find((part) => part?.inlineData?.data)?.inlineData?.data ||
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

const extractErrorMessage = (data) => {
  if (typeof data?.error === 'string') return data.error;
  if (typeof data?.error?.message === 'string') return data.error.message;
  if (typeof data?.message === 'string') return data.message;
  return 'APIYI request failed.';
};

const isRateLimitError = (status, message) => {
  return status === 429 || /rate limit|try again/i.test(message);
};

const getRetryDelayMs = (response, message, attempt) => {
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

const parseDataUrl = (dataUrl) => {
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

const extractImageEditRequest = (body) => {
  if (typeof body?.prompt === 'string' && typeof body?.image === 'string') {
    return {
      model: body.model || APIYI_MODEL,
      prompt: body.prompt,
      image: body.image,
      size: body.size,
    };
  }

  const content = body?.messages?.[0]?.content;
  if (!Array.isArray(content)) return null;

  const prompt = content.find((part) => part?.type === 'text')?.text;
  const image = content.find((part) => part?.type === 'image_url')?.image_url?.url;

  if (typeof prompt !== 'string' || typeof image !== 'string') return null;

  return {
    model: body.model || APIYI_MODEL,
    prompt,
    image,
    size: body.size,
  };
};

export const handler = async (request) => {
  if (request.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        Allow: 'OPTIONS, POST',
      },
      body: '',
    };
  }

  if (request.httpMethod !== 'POST') {
    return buildJsonResponse(405, { error: 'Method not allowed.' });
  }

  const apiKey = process.env.APIYI_API_KEY || process.env.VITE_APIYI_API_KEY;
  if (!apiKey) {
    return buildJsonResponse(500, { error: 'APIYI_API_KEY is not configured on the server.' });
  }

  let parsedBody;
  try {
    parsedBody = JSON.parse(request.body || '{}');
  } catch {
    return buildJsonResponse(400, { error: 'Request body must be valid JSON.' });
  }

  const isNanoBananaRequest =
    request.path?.includes('/api/nano-banana-edit') ||
    request.queryStringParameters?.route === 'nano-banana-edit';
  const imageEditRequest = !isNanoBananaRequest ? extractImageEditRequest(parsedBody) : null;

  if (isNanoBananaRequest) {
    const hasContents = Array.isArray(parsedBody.contents) && parsedBody.contents.length > 0;
    if (!hasContents) {
      return buildJsonResponse(400, { error: 'Missing required field: contents.' });
    }
  } else if (!imageEditRequest) {
    return buildJsonResponse(400, { error: 'Missing required fields: prompt and image.' });
  }

  try {
    for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
      const upstreamUrl = isNanoBananaRequest
        ? `${APIYI_BASE_URL}/v1beta/models/${NANO_BANANA_MODEL}:generateContent`
        : `${APIYI_BASE_URL}/v1/images/edits`;

      let upstreamBody;
      let headers = {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      };

      if (isNanoBananaRequest) {
        upstreamBody = JSON.stringify(parsedBody);
        headers = {
          ...headers,
          'Content-Type': 'application/json',
        };
      } else {
        const { mimeType, buffer } = parseDataUrl(imageEditRequest.image);
        const formData = new FormData();
        formData.append('model', imageEditRequest.model);
        formData.append('prompt', imageEditRequest.prompt);
        formData.append('response_format', 'url');
        formData.append('image[]', new Blob([buffer], { type: mimeType }), 'template.png');
        if (imageEditRequest.size) {
          formData.append('size', imageEditRequest.size);
        }
        upstreamBody = formData;
      }

      const upstreamResponse = await fetch(upstreamUrl, {
        method: 'POST',
        headers,
        body: upstreamBody,
      });

      const data = await upstreamResponse.json().catch(() => null);

      if (!upstreamResponse.ok) {
        const upstreamError = extractErrorMessage(data);

        if (attempt < MAX_RATE_LIMIT_RETRIES && isRateLimitError(upstreamResponse.status, upstreamError)) {
          await sleep(getRetryDelayMs(upstreamResponse, upstreamError, attempt));
          continue;
        }

        return buildJsonResponse(upstreamResponse.status, { error: upstreamError, details: data });
      }

      const imagePayload = extractImagePayload(data);
      if (!imagePayload) {
        return buildJsonResponse(502, { error: 'APIYI did not return a usable image payload.', details: data });
      }

      return buildJsonResponse(200, imagePayload);
    }

    return buildJsonResponse(429, { error: 'Rate limit reached. Please try again shortly.' });
  } catch (error) {
    return buildJsonResponse(500, {
      error: error instanceof Error ? error.message : 'Unexpected server error.',
    });
  }
};

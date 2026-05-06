import { base64ToDataUrl } from '../utils/image';
import { t } from '../utils/i18n';

const IMAGE_EDIT_ENDPOINT = import.meta.env.DEV
  ? '/api/generate-wrap'
  : '/.netlify/functions/generate-wrap';
const GPT_IMAGE_MODEL = 'gpt-image-2-all';
const MAX_RATE_LIMIT_RETRIES = 1;
const REQUEST_TIMEOUT_MS = 90_000;

const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const extractErrorMessage = (errorBody: any): string => {
  if (typeof errorBody?.error === 'string') return errorBody.error;
  if (typeof errorBody?.error?.message === 'string') return errorBody.error.message;
  if (typeof errorBody?.message === 'string') return errorBody.message;
  return t('main.generationRequestFailed');
};

const getRetryDelayMs = (response: Response, errorMessage: string, attempt: number): number => {
  const retryAfter = response.headers.get('retry-after');
  const retryAfterSeconds = retryAfter ? Number.parseFloat(retryAfter) : Number.NaN;

  if (!Number.isNaN(retryAfterSeconds) && retryAfterSeconds >= 0) {
    return Math.min(Math.ceil(retryAfterSeconds * 1000), 10_000);
  }

  const messageDelay = errorMessage.match(/try again in\s+(\d+)\s*ms/i);
  if (messageDelay) {
    return Math.min(Number.parseInt(messageDelay[1], 10) + 250, 10_000);
  }

  return Math.min(750 * 2 ** attempt, 8_000);
};

const isRateLimitError = (response: Response, errorMessage: string): boolean => {
  return response.status === 429 || /rate limit|try again/i.test(errorMessage);
};

const isTemporaryProviderError = (response: Response, errorMessage: string): boolean => {
  return response.status === 408 || response.status === 429 || response.status >= 500 || /rate limit|timeout|busy|try again/i.test(errorMessage);
};

const buildEditPrompt = (userPrompt: string) => `基于上传的 Tesla 贴膜模板图进行编辑，严格遵守以下规则：
1. 完整保留原始模板的画布比例、零件布局、黑色轮廓线和留白结构。
2. 只在模板内部可贴膜区域生成设计，不要修改背景，不要新增外框或裁切线。
3. 输出必须是平面的 2D 生产贴膜稿，不要渲染成实车照片，不要做透视变形。
4. 如果未特别要求，不要额外添加文字、Logo、水印或多余元素。
5. 保持图像干净、高清、适合车辆贴膜打印。

用户设计要求：
${userPrompt}`;

const normalizeImageValue = (value: string): string => {
  if (value.startsWith('data:') || /^https?:\/\//i.test(value)) {
    return value;
  }

  return base64ToDataUrl(value);
};

const extractImageFromPayload = (data: any): string | null => {
  const imageInResponse =
    data?.imageUrl ||
    data?.b64_json ||
    data?.data?.[0]?.url ||
    data?.data?.[0]?.b64_json ||
    data?.candidates?.[0]?.content?.parts?.find((part: any) => part?.inlineData?.data)?.inlineData?.data;

  if (typeof imageInResponse === 'string' && imageInResponse) {
    return normalizeImageValue(imageInResponse);
  }

  const content = data?.content || data?.choices?.[0]?.message?.content;
  if (typeof content !== 'string' || !content.trim()) {
    return null;
  }

  // gpt-image-2-all typically returns a Markdown image link or a direct URL in the content
  // Format: ![image](url) or just the URL
  const urlMatch = content.match(/!\[.*?\]\((.*?)\)/) || content.match(/(https?:\/\/[^\s)]+)/);
  const imageUrl = urlMatch ? urlMatch[1] : null;

  if (imageUrl) {
    return imageUrl;
  }

  // Last resort: check if content itself is a base64 string
  if (content.length > 1000 && !content.includes(' ')) {
    return normalizeImageValue(content);
  }

  return null;
};

const buildImageEditBody = (imageDataUrl: string, userPrompt: string) => ({
  model: GPT_IMAGE_MODEL,
  prompt: buildEditPrompt(userPrompt),
  image: imageDataUrl,
  response_format: 'url',
});

class ApiYiRequestError extends Error {
  temporary: boolean;

  constructor(message: string, temporary: boolean) {
    super(message);
    this.name = 'ApiYiRequestError';
    this.temporary = temporary;
  }
}

const requestImage = async (
  endpoint: string,
  body: unknown,
  controller: AbortController,
  label: string
): Promise<string> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RATE_LIMIT_RETRIES; attempt += 1) {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        throw error;
      }

      throw new ApiYiRequestError(t('main.generationNetworkFailed'), true);
    }

    if (import.meta.env.DEV) {
      console.log(`[${label}] response status:`, response.status);
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => null);
      const errorMessage = extractErrorMessage(errorBody);
      lastError = new ApiYiRequestError(errorMessage, isTemporaryProviderError(response, errorMessage));

      if (import.meta.env.DEV) {
        console.error(`[${label}] error:`, response.status, errorBody);
      }

      if (attempt < MAX_RATE_LIMIT_RETRIES && isRateLimitError(response, errorMessage)) {
        await sleep(getRetryDelayMs(response, errorMessage, attempt));
        continue;
      }

      throw lastError;
    }

    const data = await response.json();
    const imageUrl = extractImageFromPayload(data);

    if (imageUrl) {
      return imageUrl;
    }

    lastError = new Error(t('main.generationNoImage'));
    break;
  }

  throw lastError || new Error(t('main.generationRequestFailed'));
};

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  const imageDataUrl = imageBase64.startsWith('data:')
    ? imageBase64
    : `data:image/png;base64,${imageBase64}`;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    if (import.meta.env.DEV) {
      console.log(`[image edit:${GPT_IMAGE_MODEL}] calling:`, IMAGE_EDIT_ENDPOINT);
    }

    return await requestImage(
      IMAGE_EDIT_ENDPOINT,
      buildImageEditBody(imageDataUrl, userPrompt),
      controller,
      `image edit:${GPT_IMAGE_MODEL}`
    );
  } catch (error: any) {
    if (error?.name === 'AbortError') {
      throw new Error(`gpt-image-2 request timed out after ${Math.round(REQUEST_TIMEOUT_MS / 1000)} seconds.`);
    }
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
};

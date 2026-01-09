// Free image generation service using Hugging Face Inference API
// Uses Stable Diffusion models for free image generation

// Get API keys from environment - check both possible sources
const HUGGINGFACE_API_KEY = (import.meta.env.VITE_HUGGINGFACE_API_KEY || '').trim();
// Hugging Face has changed their API endpoint - use the new router endpoint
const HUGGINGFACE_API_URL = 'https://router.huggingface.co';

// Fallback to Replicate if Hugging Face fails (also has free tier)
const REPLICATE_API_TOKEN = (import.meta.env.VITE_REPLICATE_API_TOKEN || '').trim();

// Debug on load
if (typeof window !== 'undefined') {
  console.log('API Keys loaded:', {
    huggingface: HUGGINGFACE_API_KEY ? `${HUGGINGFACE_API_KEY.substring(0, 10)}...` : 'NOT SET',
    replicate: REPLICATE_API_TOKEN ? `${REPLICATE_API_TOKEN.substring(0, 10)}...` : 'NOT SET',
    env_keys: Object.keys(import.meta.env).filter(k => k.includes('HUGGING') || k.includes('REPLICATE'))
  });
}

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  try {
    // Debug: Check if API keys are loaded
    console.log('Free Image Service - Checking API keys:');
    console.log('HUGGINGFACE_API_KEY length:', HUGGINGFACE_API_KEY ? HUGGINGFACE_API_KEY.length : 0);
    console.log('HUGGINGFACE_API_KEY preview:', HUGGINGFACE_API_KEY ? `${HUGGINGFACE_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('REPLICATE_API_TOKEN:', REPLICATE_API_TOKEN ? `${REPLICATE_API_TOKEN.substring(0, 10)}...` : 'NOT SET');
    console.log('All env vars:', Object.keys(import.meta.env).filter(k => k.includes('API')));
    
    // Try Hugging Face first (completely free for some models)
    if (HUGGINGFACE_API_KEY && HUGGINGFACE_API_KEY.length > 0) {
      console.log('Attempting Hugging Face image generation...');
      try {
        return await generateWithHuggingFace(imageBase64, userPrompt);
      } catch (error) {
        console.warn('Hugging Face failed, trying Replicate:', error);
        // Fall through to Replicate
      }
    } else {
      console.warn('Hugging Face API key not found or empty');
    }

    // Try Replicate as fallback (has free tier)
    if (REPLICATE_API_TOKEN && REPLICATE_API_TOKEN.trim() !== '') {
      console.log('Attempting Replicate image generation...');
      try {
        return await generateWithReplicate(imageBase64, userPrompt);
      } catch (error) {
        console.warn('Replicate failed:', error);
      }
    } else {
      console.warn('Replicate API token not found or empty');
    }

    // If no API keys provided, throw helpful error
    throw new Error(`所有AI服务都无法使用。\n\n当前状态：\n- Hugging Face: ${HUGGINGFACE_API_KEY ? 'API Key已配置，但所有模型都不可用(410错误)' : '未配置'}\n- Replicate: ${REPLICATE_API_TOKEN ? '已配置' : '未配置'}\n- Gemini: 模型不存在(404错误)\n\n建议：\n1. 等待一段时间后重试（可能是临时服务问题）\n2. 或者配置OpenAI API（付费但稳定）\n3. 检查网络连接是否正常`);

  } catch (error: any) {
    console.error("Free Image Service Error:", error);
    throw new Error(error.message || "Failed to generate design with free service.");
  }
};

// Hugging Face Stable Diffusion
const generateWithHuggingFace = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  // Try multiple models, starting with the most commonly available
  const models = [
    'stabilityai/stable-diffusion-2-1',
    'CompVis/stable-diffusion-v1-4',
    'runwayml/stable-diffusion-v1-5',
    'stabilityai/stable-diffusion-xl-base-1.0'
  ];
  
  let lastError: Error | null = null;
  
  for (const model of models) {
    try {
      console.log(`Trying Hugging Face model: ${model}`);
      return await tryHuggingFaceModel(model, imageBase64, userPrompt);
    } catch (error: any) {
      console.warn(`Model ${model} failed:`, error.message);
      lastError = error;
      // If 410 or 404, try next model
      if (error.response?.status === 410 || error.response?.status === 404 || 
          error.message?.includes('410') || error.message?.includes('404') || 
          error.message?.includes('not available') || error.message?.includes('Gone')) {
        continue; // Try next model
      }
      // Other errors (like 503, 401), throw immediately
      throw error;
    }
  }
  
  // All models failed
  throw lastError || new Error('所有Hugging Face模型都不可用。请稍后重试或使用其他AI服务。');
};

const tryHuggingFaceModel = async (
  model: string,
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  
  const enhancedPrompt = `Professional vehicle wrap design: ${userPrompt}. 
Flat 2D technical drawing style, black outlines defining vehicle parts, 
clean production-ready layout, high quality, detailed design, vector art style.`;

  // Use Vite proxy to avoid CORS issues
  // The proxy is configured in vite.config.ts
  // New Hugging Face router API endpoint
  const proxyUrl = `/api/huggingface/models/${model}`;
  
  console.log('Calling Hugging Face via proxy:', proxyUrl);
  console.log('API Key available:', HUGGINGFACE_API_KEY ? `YES (${HUGGINGFACE_API_KEY.length} chars)` : 'NO');
  
  if (!HUGGINGFACE_API_KEY || HUGGINGFACE_API_KEY.length === 0) {
    throw new Error('Hugging Face API key is not configured. Please set VITE_HUGGINGFACE_API_KEY in .env.local and restart the server.');
  }
  
  const response = await fetch(proxyUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-HuggingFace-Token': HUGGINGFACE_API_KEY, // Pass token via custom header
    },
    body: JSON.stringify({
      inputs: enhancedPrompt,
      parameters: {
        num_inference_steps: 20, // Reduced for faster generation
        guidance_scale: 7.5,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Handle different error statuses
    if (response.status === 503) {
      // Model is loading, wait and retry
      const estimatedTime = errorData.estimated_time || 20;
      console.log(`Model ${model} is loading, waiting ${estimatedTime}s...`);
      await new Promise(resolve => setTimeout(resolve, Math.min(estimatedTime * 1000, 30000))); // Max 30s
      return tryHuggingFaceModel(model, imageBase64, userPrompt); // Retry same model
    }
    
    if (response.status === 410 || response.status === 404) {
      // Model not found or removed, return error with status to trigger next model
      const error: any = new Error(`Model ${model} not available (${response.status})`);
      error.response = response;
      throw error;
    }
    
    const errorMsg = errorData.error || errorData.message || `Hugging Face API error: ${response.status}`;
    const error: any = new Error(errorMsg);
    error.response = response;
    throw error;
  }

  const blob = await response.blob();
  
  // Convert blob to base64
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        // Extract base64 part
        const base64 = reader.result.split(',')[1];
        resolve(`data:image/png;base64,${base64}`);
      } else {
        reject(new Error('Failed to convert image'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

// Replicate Stable Diffusion (has free tier)
const generateWithReplicate = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  const enhancedPrompt = `Professional vehicle wrap design: ${userPrompt}. 
Flat 2D technical drawing style, black outlines defining vehicle parts, 
clean production-ready layout, high quality, detailed design.`;

  // Use Vite proxy to avoid CORS issues
  const response = await fetch('/api/replicate/v1/predictions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Replicate-Token': REPLICATE_API_TOKEN, // Pass token via custom header
    },
    body: JSON.stringify({
      version: 'db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf', // Stable Diffusion 2.1
      input: {
        prompt: enhancedPrompt,
        image_dimensions: '1024x1024',
        num_outputs: 1,
        num_inference_steps: 50,
        guidance_scale: 7.5,
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Replicate API error: ${response.status}`);
  }

  const prediction = await response.json();
  
    // Poll for completion
    let status = prediction.status;
    let result = prediction;
    
    while (status === 'starting' || status === 'processing') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const statusResponse = await fetch(`/api/replicate/v1/predictions/${prediction.id}`, {
        headers: {
          'X-Replicate-Token': REPLICATE_API_TOKEN,
        }
      });
    
    result = await statusResponse.json();
    status = result.status;
    
    if (status === 'failed' || status === 'canceled') {
      throw new Error(result.error || 'Prediction failed');
    }
  }

  if (result.output && result.output[0]) {
    // Fetch the image URL and convert to base64
    const imageResponse = await fetch(result.output[0]);
    const blob = await imageResponse.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(`data:image/png;base64,${base64}`);
        } else {
          reject(new Error('Failed to convert image'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  throw new Error('No output from Replicate');
};

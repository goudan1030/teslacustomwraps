// Free image generation service using Hugging Face Inference API
// Uses Stable Diffusion models for free image generation

// Get API keys from environment - check both possible sources
const HUGGINGFACE_API_KEY = (import.meta.env.VITE_HUGGINGFACE_API_KEY || '').trim();
const HUGGINGFACE_API_URL = 'https://api-inference.huggingface.co/models';

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
    throw new Error('未配置免费API服务。请配置以下任一服务：\n\n1. Hugging Face (完全免费):\n   访问 https://huggingface.co/settings/tokens 获取Token\n   在.env.local中添加: VITE_HUGGINGFACE_API_KEY=your_token\n   当前状态: ' + (HUGGINGFACE_API_KEY ? '已配置但未加载，请重启服务器' : '未配置') + '\n\n2. Replicate (免费额度):\n   访问 https://replicate.com/account/api-tokens 获取Token\n   在.env.local中添加: VITE_REPLICATE_API_TOKEN=your_token\n\n或者等待Gemini API速率限制解除后再试。\n\n提示：如果已配置但未生效，请重启开发服务器（npm run dev）');

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
  // Use the most stable and commonly available model
  // runwayml/stable-diffusion-v1-5 is the most reliable
  const model = 'runwayml/stable-diffusion-v1-5';
  
  return await tryHuggingFaceModel(model, imageBase64, userPrompt);
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
    // Handle different error statuses
    if (response.status === 503) {
      // Model is loading, wait and retry
      const data = await response.json().catch(() => ({}));
      const estimatedTime = data.estimated_time || 20;
      console.log(`Model ${model} is loading, waiting ${estimatedTime}s...`);
      await new Promise(resolve => setTimeout(resolve, Math.min(estimatedTime * 1000, 30000))); // Max 30s
      return tryHuggingFaceModel(model, imageBase64, userPrompt); // Retry same model
    }
    
    if (response.status === 410 || response.status === 404) {
      // Model not found or removed, try alternative
      console.warn(`Model ${model} not available (${response.status}), trying alternative...`);
      throw new Error(`Model ${model} not available. Please try a different model.`);
    }
    
    const errorData = await response.json().catch(() => ({}));
    const errorMsg = errorData.error || errorData.message || `Hugging Face API error: ${response.status}`;
    throw new Error(errorMsg);
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

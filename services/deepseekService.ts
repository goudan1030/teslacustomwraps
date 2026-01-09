// DeepSeek API service for vehicle wrap design generation
// DeepSeek API endpoint and configuration

const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || '';
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured. Please set VITE_DEEPSEEK_API_KEY in your .env.local file.');
    }

    // Construct the system prompt for vehicle wrap design
    const systemPrompt = `You are an expert vehicle wrap designer AI assistant. 
Your task is to help users create custom vehicle wrap designs based on their templates and design themes.

CRITICAL DESIGN RULES:
1. STRICTLY PRESERVE the original image layout, aspect ratio, and black outline contours.
2. Apply graphics ONLY within the white spaces of the template parts.
3. Do NOT paint over the background (keep it white/transparent as in original).
4. Do NOT distort the shapes of the car parts.
5. The output must look like a flat 2D printable vehicle wrap file ready for production.
6. Do not add any text unless explicitly requested in the theme.

User's design theme: ${userPrompt}`;

    // For image processing, we'll use DeepSeek Vision model
    // Note: DeepSeek may not support direct image generation/editing
    // This is a placeholder implementation that would need to be adapted based on DeepSeek's actual capabilities
    
    // Convert base64 image to data URL for embedding
    const imageDataUrl = `data:image/png;base64,${imageBase64}`;

    // Since DeepSeek API may not directly support image editing,
    // we'll use a vision model to analyze and provide design guidance
    // For actual image generation, you may need to use DeepSeek's image generation endpoint
    // or combine with other image processing services

    const requestBody = {
      model: 'deepseek-chat', // Using chat model - adjust based on available models
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `Please help me design a vehicle wrap based on this template. The design theme is: "${userPrompt}". The template image shows the vehicle outline that must be preserved exactly.`
            },
            {
              type: 'image_url',
              image_url: {
                url: imageDataUrl
              }
            }
          ]
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    };

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `DeepSeek API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // DeepSeek chat models return text responses, not images
    // For actual image generation, you would need:
    // 1. DeepSeek's image generation API (if available)
    // 2. Or use a combination approach where DeepSeek generates design instructions
    //    and another service creates the actual image
    
    // For now, return the original image as a placeholder
    // TODO: Integrate with DeepSeek image generation endpoint when available
    // or use an image generation service that can create the design based on DeepSeek's analysis
    
    console.warn('DeepSeek returned text response. Image generation requires additional service integration.');
    
    // Return original image as placeholder until image generation is implemented
    return `data:image/png;base64,${imageBase64}`;

  } catch (error: any) {
    console.error("DeepSeek API Error:", error);
    throw new Error(error.message || "Failed to generate design with DeepSeek.");
  }
};

// Alternative: If DeepSeek has an image generation endpoint, use this structure
export const generateWrapDesignWithImageAPI = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  try {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DeepSeek API key is not configured.');
    }

    // This is a placeholder for DeepSeek image generation API
    // Update the endpoint and request format based on DeepSeek's actual image API
    const response = await fetch('https://api.deepseek.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-image', // Update model name when available
        prompt: `Vehicle wrap design: ${userPrompt}. Preserve original template contours and layout.`,
        image: imageBase64,
        n: 1,
        size: '1024x1024'
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract image URL or base64 from response
    if (data.data && data.data[0] && data.data[0].url) {
      // If URL returned, convert to base64
      const imageResponse = await fetch(data.data[0].url);
      const blob = await imageResponse.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Failed to convert image'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    }
    
    throw new Error('No image data in response');

  } catch (error: any) {
    console.error("DeepSeek Image API Error:", error);
    throw error;
  }
};

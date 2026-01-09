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

    // Note: DeepSeek Chat API does not support image inputs (multimodal)
    // The API only accepts text content in messages. We'll use text-only prompts.
    // For actual image generation, we would need DeepSeek's image generation API (if available)
    // or integrate with another image generation service.
    
    // Construct the system prompt for vehicle wrap design
    const systemPrompt = `You are an expert vehicle wrap designer AI assistant. 
Your task is to help users create custom vehicle wrap designs based on vehicle templates and design themes.

CRITICAL DESIGN RULES:
1. STRICTLY PRESERVE the original template layout, aspect ratio, and outline contours.
2. Apply graphics ONLY within the designated areas of the template parts.
3. Do NOT paint over the background (keep it white/transparent as in original).
4. Do NOT distort the shapes of the vehicle parts.
5. The output must look like a flat 2D printable vehicle wrap file ready for production.
6. Do not add any text unless explicitly requested in the theme.

User's design theme: ${userPrompt}`;

    // DeepSeek API only supports text messages, not images
    // content must be a string, not an array
    const userMessage = `I have a vehicle wrap template image with black outlines and white fill areas. 
I want to apply the following design theme: "${userPrompt}"

The template is a 2D flat layout that must be preserved exactly. The design should:
- Preserve all black outline contours exactly
- Apply the design theme only within the white areas
- Maintain the exact layout and proportions
- Be ready for production printing

Please provide detailed design guidance following these requirements.`;

    const requestBody = {
      model: 'deepseek-chat', // Using chat model - text only
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userMessage  // Must be a string, not an array
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
    // The API only supports text completion, not image generation
    console.log('DeepSeek API Response:', data);
    
    // Extract the text response
    const textResponse = data.choices?.[0]?.message?.content || '';
    console.log('Design guidance:', textResponse);
    
    // Since DeepSeek Chat API cannot generate images, we return the original template
    // In a production environment, you would need to:
    // 1. Use DeepSeek's image generation API (if available)
    // 2. Use another image generation service (e.g., Stable Diffusion, DALL-E)
    // 3. Process the template locally with the design guidance from DeepSeek
    
    // For now, return the original image as a placeholder
    // TODO: Integrate with actual image generation service
    console.warn('DeepSeek Chat API does not support image generation. Returning original template as placeholder.');
    console.warn('Design guidance received:', textResponse.substring(0, 200) + '...');
    
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

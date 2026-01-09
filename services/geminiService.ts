// Google Gemini API service for vehicle wrap design generation
// Supports Gemini 1.5 Pro, Gemini 2.0, and newer models

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  try {
    if (!GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured. Please set VITE_GEMINI_API_KEY in your .env.local file.');
    }

    // Try models in order: Use correct Gemini API model names
    // Based on Google's Gemini API documentation
    const models = [
      'gemini-1.5-flash',  // Most common and stable
      'gemini-1.5-pro',    // More capable version
      'gemini-pro'         // Legacy name
    ];
    
    let lastError: Error | null = null;
    
    for (const model of models) {
      try {
        console.log(`Trying Gemini model: ${model}`);
        let response = await callGeminiAPI(model, imageBase64, userPrompt);

        // Handle 429 rate limit - wait and retry once
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After');
          const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000; // Default 60 seconds
          
          console.warn(`Rate limit hit (429). Waiting ${waitTime / 1000} seconds before retry...`);
          await new Promise(resolve => setTimeout(resolve, Math.min(waitTime, 60000))); // Max 60s wait
          
          // Retry once
          response = await callGeminiAPI(model, imageBase64, userPrompt);
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          
          // Handle specific error codes
          if (response.status === 429) {
            const errorMsg = errorData.error?.message || 'Rate limit exceeded';
            throw new Error(`Gemini API速率限制已达到（429）。请稍候再试，或配置备用API服务。\n${errorMsg}\n\n提示：可以在.env.local中添加VITE_HUGGINGFACE_API_KEY或VITE_REPLICATE_API_TOKEN作为备用。`);
          }
          
          if (response.status === 404 || errorData.error?.message?.includes('not found')) {
            console.warn(`Model ${model} not available, trying next model`);
            lastError = new Error(`Model ${model} not found`);
            continue; // Try next model
          }
          
          throw new Error(errorData.error?.message || `Gemini API error: ${response.status} ${response.statusText}`);
        }

        // Success - process response
        const data = await response.json();

        // Extract image from response
        // Note: Gemini API currently doesn't support image generation directly
        // It can analyze images but returns text descriptions
        if (data.candidates && data.candidates[0]) {
          const candidate = data.candidates[0];
          
          // Check for image in content parts (if Gemini starts supporting image generation)
          if (candidate.content && candidate.content.parts) {
            for (const part of candidate.content.parts) {
              if (part.inlineData && part.inlineData.data) {
                const mimeType = part.inlineData.mimeType || 'image/png';
                return `data:${mimeType};base64,${part.inlineData.data}`;
              }
            }
          }
          
          // Gemini returns text description, not images
          const textResponse = candidate.content?.parts?.[0]?.text;
          if (textResponse) {
            console.log('Gemini analysis:', textResponse.substring(0, 200));
          }
        }

        // Gemini doesn't generate images, return original template
        // TODO: Use Gemini's text output with another image generation service
        console.warn('Gemini API does not support direct image generation. It can analyze images but returns text descriptions.');
        return `data:image/png;base64,${imageBase64}`;
        
      } catch (error: any) {
        console.error(`Error with model ${model}:`, error);
        lastError = error;
        // Continue to next model
        continue;
      }
    }

    // If all models failed, throw the last error
    if (lastError) {
      throw lastError;
    }

    throw new Error('All Gemini models failed');

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    // Re-throw with improved error message
    if (error.message.includes('速率限制') || error.message.includes('429')) {
      throw error; // Already has good error message
    }
    throw new Error(error.message || "Gemini API调用失败。请检查API密钥配置或稍后重试。");
  }
};

// Helper function to call Gemini API
const callGeminiAPI = async (
  model: string,
  imageBase64: string,
  userPrompt: string
): Promise<Response> => {
  const systemInstruction = `You are an expert vehicle wrap designer AI assistant.
Your task is to analyze vehicle wrap templates and generate custom designs.

CRITICAL DESIGN RULES:
1. STRICTLY PRESERVE the original image layout, aspect ratio, and black outline contours.
2. Apply graphics ONLY within the white spaces of the template parts.
3. Do NOT paint over the background (keep it white/transparent as in original).
4. Do NOT distort the shapes of the car parts.
5. The output must look like a flat 2D printable vehicle wrap file ready for production.
6. Do not add any text unless explicitly requested in the theme.`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png',
              data: imageBase64
            }
          },
          {
            text: `Apply this design theme to the vehicle template: "${userPrompt}"
            
Please generate an image that follows the design rules. The template shows vehicle parts with black outlines and white fill areas. Apply the design theme only within the white areas while preserving all black outlines exactly.`
          }
        ]
      }
    ],
    systemInstruction: {
      parts: [
        {
          text: systemInstruction
        }
      ]
    },
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 8192,
    }
  };

  // Gemini API endpoint
  // Use v1beta API with correct model name format
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  console.log(`Calling Gemini API: ${model}`);
  
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });
};

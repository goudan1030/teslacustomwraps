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

    // Try Gemini 2.0 Flash first, fallback to Gemini 1.5 Pro
    let model = 'gemini-2.0-flash-exp';
    let response = await callGeminiAPI(model, imageBase64, userPrompt);

    // If model not found, try Gemini 1.5 Pro
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (errorData.error?.message?.includes('not found') || response.status === 404) {
        console.warn('Gemini 2.0 not available, trying Gemini 1.5 Pro');
        model = 'gemini-1.5-pro';
        response = await callGeminiAPI(model, imageBase64, userPrompt);
      }
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract image from response
    // Gemini can return images in the response candidates
    if (data.candidates && data.candidates[0]) {
      const candidate = data.candidates[0];
      
      // Check for image in content parts
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            const mimeType = part.inlineData.mimeType || 'image/png';
            return `data:${mimeType};base64,${part.inlineData.data}`;
          }
        }
      }
    }

    // If no image in response, Gemini might have returned text describing the design
    // In that case, we'll use the text to create a prompt for image generation
    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textResponse) {
      console.log('Gemini returned text description:', textResponse);
      // For now, return original image as Gemini text-to-image is still evolving
      // In the future, we could use this text with DALL-E or another image generator
      console.warn('Gemini returned text instead of image. Image generation capability may require a different approach.');
    }

    // Fallback: return original image if no image generated
    console.warn('No image data in Gemini response. Returning original template.');
    return `data:image/png;base64,${imageBase64}`;

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate design with Gemini.");
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
  const url = `${GEMINI_API_URL}/${model}:generateContent?key=${GEMINI_API_KEY}`;
  
  return await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody)
  });
};

// OpenAI API service for vehicle wrap design generation
// Uses GPT-4 Vision for image analysis and DALL-E for image generation

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1';

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured. Please set VITE_OPENAI_API_KEY in your .env.local file.');
    }

    // Step 1: Use GPT-4 Vision to analyze the template image and generate a detailed design prompt
    const visionPrompt = `You are an expert vehicle wrap designer. Analyze this vehicle wrap template image and create a detailed design description.

The template shows a 2D flat layout of vehicle parts with:
- Black outline contours (MUST be preserved exactly)
- White fill areas (where design should be applied)
- Specific vehicle parts layout

User's design theme: "${userPrompt}"

CRITICAL REQUIREMENTS:
1. The design must preserve ALL black outline contours exactly as shown
2. Design elements should ONLY be applied within the white areas
3. The layout, proportions, and part shapes must remain unchanged
4. The output should be a flat 2D printable design file
5. Do not add text unless explicitly requested

Generate a detailed, specific prompt for creating this vehicle wrap design that another AI image generator can use. The prompt should describe:
- The exact design theme and style
- Color scheme and textures
- Graphic elements and patterns
- How to preserve the template structure`;

    // Analyze the template with GPT-4 Vision
    // Try gpt-4o first, fallback to gpt-4-turbo if needed
    let visionModel = 'gpt-4o';
    let visionResponse = await fetch(`${OPENAI_API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: visionModel,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: visionPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/png;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        max_tokens: 1000
      })
    });

    // If gpt-4o fails, try gpt-4-turbo
    if (!visionResponse.ok) {
      const errorData = await visionResponse.json().catch(() => ({}));
      if (errorData.error?.code === 'model_not_found' || errorData.error?.message?.includes('gpt-4o')) {
        console.warn('GPT-4o not available, falling back to gpt-4-turbo');
        visionModel = 'gpt-4-turbo';
        visionResponse = await fetch(`${OPENAI_API_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: visionModel,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: visionPrompt
                  },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:image/png;base64,${imageBase64}`
                    }
                  }
                ]
              }
            ],
            max_tokens: 1000
          })
        });
      }
    }

    if (!visionResponse.ok) {
      const errorData = await visionResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI Vision API error: ${visionResponse.status} ${visionResponse.statusText}`);
    }

    const visionData = await visionResponse.json();
    const designDescription = visionData.choices?.[0]?.message?.content || userPrompt;
    console.log('GPT-4 Vision analysis:', designDescription);

    // Step 2: Use DALL-E 3 to generate the design image
    // Note: DALL-E 3 doesn't support image input, so we generate based on the description
    // In production, you might want to use image editing tools or other services
    const dallePrompt = `Create a professional vehicle wrap design: ${designDescription}

Style: Flat 2D technical drawing, black outlines defining vehicle parts, with the requested design theme applied only within the outlined areas. Clean, production-ready layout.`;

    const dalleResponse = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: dallePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json' // Request base64 encoded image
      })
    });

    if (!dalleResponse.ok) {
      const errorData = await dalleResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI DALL-E API error: ${dalleResponse.status} ${dalleResponse.statusText}`);
    }

    const dalleData = await dalleResponse.json();
    
    // Extract the base64 image from DALL-E response
    if (dalleData.data && dalleData.data[0] && dalleData.data[0].b64_json) {
      const generatedImageBase64 = dalleData.data[0].b64_json;
      return `data:image/png;base64,${generatedImageBase64}`;
    }

    throw new Error('No image data in DALL-E response');

  } catch (error: any) {
    console.error("OpenAI API Error:", error);
    
    // If Vision API fails, fallback to DALL-E with original prompt
    if (error.message.includes('Vision')) {
      console.warn('GPT-4 Vision failed, falling back to DALL-E with original prompt');
      return generateWithDALLEOnly(imageBase64, userPrompt);
    }
    
    throw new Error(error.message || "Failed to generate design with OpenAI.");
  }
};

// Fallback: Use DALL-E only without Vision analysis
const generateWithDALLEOnly = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  try {
    const dallePrompt = `Professional vehicle wrap design: ${userPrompt}. 
Flat 2D technical drawing style with black outlines defining vehicle parts. 
The design theme should be applied within the outlined areas. 
Clean, production-ready layout suitable for vehicle wrap printing.`;

    const response = await fetch(`${OPENAI_API_URL}/images/generations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt: dallePrompt,
        n: 1,
        size: '1024x1024',
        quality: 'standard',
        response_format: 'b64_json'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `DALL-E API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.data && data.data[0] && data.data[0].b64_json) {
      return `data:image/png;base64,${data.data[0].b64_json}`;
    }

    throw new Error('No image data in DALL-E response');

  } catch (error: any) {
    console.error("DALL-E Fallback Error:", error);
    // If everything fails, return original image as fallback
    console.warn('Returning original template as fallback');
    return `data:image/png;base64,${imageBase64}`;
  }
};

import { GoogleGenAI } from "@google/genai";

// Initialize the client. API_KEY is injected by the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string
): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image';
    
    // We construct a very specific prompt to ensure strict adherence to the template.
    const systemPrompt = `
      You are an expert vehicle wrap designer. 
      Task: Apply the design theme "${userPrompt}" to the provided vehicle template image.
      
      CRITICAL RULES:
      1. STRICTLY PRESERVE the original image layout, aspect ratio, and black outline contours.
      2. Apply the graphics ONLY within the white spaces of the template parts.
      3. Do NOT paint over the background (keep it white/transparent as in original).
      4. Do NOT distort the shapes of the car parts.
      5. The output must look like a flat 2D printable vehicle wrap file ready for production.
      6. Do not add any text unless explicitly requested in the theme.
      
      Theme details: ${userPrompt}.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/png', // Assuming PNG for templates, but works with JPEG
              data: imageBase64,
            },
          },
          {
            text: systemPrompt,
          },
        ],
      },
    });

    // Extract the image from the response
    // The response structure for image generation/editing usually contains the image in the parts
    const parts = response.candidates?.[0]?.content?.parts;
    
    if (!parts) {
      throw new Error("No content generated.");
    }

    // Iterate to find the image part
    for (const part of parts) {
      if (part.inlineData && part.inlineData.data) {
        return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
      }
    }

    throw new Error("No image data found in the response.");

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate design.");
  }
};

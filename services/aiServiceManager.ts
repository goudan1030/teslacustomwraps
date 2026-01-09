// AI Service Manager - Handles multiple AI service providers
// Supports: OpenAI (paid), Hugging Face (free), Replicate (free tier)
// Falls back through providers if one fails

import { generateWrapDesign as generateWithOpenAI } from './openaiService';
import { generateWrapDesign as generateWithFree } from './freeImageService';

export type AIServiceProvider = 'openai' | 'free' | 'auto';

const DEFAULT_PROVIDER: AIServiceProvider = 'auto';

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string,
  provider: AIServiceProvider = DEFAULT_PROVIDER
): Promise<string> => {
  console.log(`Using AI provider: ${provider}`);

  // Auto mode: try providers in order of preference
  if (provider === 'auto') {
    // First try OpenAI if key is available
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      try {
        console.log('Attempting OpenAI...');
        return await generateWithOpenAI(imageBase64, userPrompt);
      } catch (error) {
        console.warn('OpenAI failed, falling back to free service:', error);
        // Fall through to free service
      }
    }

    // Fallback to free service
    console.log('Using free service...');
    return await generateWithFree(imageBase64, userPrompt);
  }

  // Explicit provider selection
  if (provider === 'openai') {
    return await generateWithOpenAI(imageBase64, userPrompt);
  }

  if (provider === 'free') {
    return await generateWithFree(imageBase64, userPrompt);
  }

  throw new Error(`Unknown provider: ${provider}`);
};

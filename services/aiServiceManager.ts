// AI Service Manager - Handles multiple AI service providers
// Supports: Gemini (free tier), OpenAI (paid), Hugging Face (free), Replicate (free tier)
// Falls back through providers if one fails

import { generateWrapDesign as generateWithOpenAI } from './openaiService';
import { generateWrapDesign as generateWithGemini } from './geminiService';
import { generateWrapDesign as generateWithFree } from './freeImageService';

export type AIServiceProvider = 'gemini' | 'openai' | 'free' | 'auto';

const DEFAULT_PROVIDER: AIServiceProvider = 'auto';

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string,
  provider: AIServiceProvider = DEFAULT_PROVIDER
): Promise<string> => {
  console.log(`Using AI provider: ${provider}`);

  // Auto mode: try providers in order of preference
  if (provider === 'auto') {
    // Priority order: Gemini (free) -> OpenAI (paid) -> Free services
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiKey) {
      try {
        console.log('Attempting Google Gemini...');
        return await generateWithGemini(imageBase64, userPrompt);
      } catch (error) {
        console.warn('Gemini failed, trying next provider:', error);
      }
    }

    // Try OpenAI if key is available
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      try {
        console.log('Attempting OpenAI...');
        return await generateWithOpenAI(imageBase64, userPrompt);
      } catch (error) {
        console.warn('OpenAI failed, trying free service:', error);
      }
    }

    // Fallback to free service
    console.log('Using free service (Hugging Face/Replicate)...');
    return await generateWithFree(imageBase64, userPrompt);
  }

  // Explicit provider selection
  if (provider === 'gemini') {
    return await generateWithGemini(imageBase64, userPrompt);
  }

  if (provider === 'openai') {
    return await generateWithOpenAI(imageBase64, userPrompt);
  }

  if (provider === 'free') {
    return await generateWithFree(imageBase64, userPrompt);
  }

  throw new Error(`Unknown provider: ${provider}`);
};

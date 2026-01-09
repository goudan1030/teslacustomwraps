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
    // Note: Gemini API doesn't support image generation, skip it
    // Priority order: Free services (Hugging Face/Replicate) -> OpenAI (paid) -> Gemini (text only, skip)
    
    // Try free services first (Hugging Face/Replicate)
    const huggingfaceKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    const replicateKey = import.meta.env.VITE_REPLICATE_API_TOKEN;
    
    if (huggingfaceKey || replicateKey) {
      try {
        console.log('Attempting free image generation service (Hugging Face/Replicate)...');
        return await generateWithFree(imageBase64, userPrompt);
      } catch (error) {
        console.warn('Free service failed, trying OpenAI:', error);
      }
    }

    // Try OpenAI if key is available
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      try {
        console.log('Attempting OpenAI...');
        return await generateWithOpenAI(imageBase64, userPrompt);
      } catch (error) {
        console.warn('OpenAI failed:', error);
      }
    }

    // Last resort: Try Gemini (though it doesn't generate images)
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiKey) {
      try {
        console.log('Attempting Google Gemini (may not support image generation)...');
        return await generateWithGemini(imageBase64, userPrompt);
      } catch (error) {
        console.warn('Gemini failed:', error);
      }
    }

    // All services failed
    throw new Error('所有AI服务都不可用。请配置至少一个可用的AI服务（Hugging Face、Replicate或OpenAI）。');
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

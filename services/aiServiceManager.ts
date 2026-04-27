// AI Service Manager - Handles multiple AI service providers
// Supports: Gemini (free tier), OpenAI (paid), Hugging Face (free), Replicate (free tier)
// Falls back through providers if one fails

import { generateWrapDesign as generateWithApiYi } from './apiYiService';
import { generateWrapDesign as generateWithOpenAI } from './openaiService';
import { generateWrapDesign as generateWithGemini } from './geminiService';
import { generateWrapDesign as generateWithFree } from './freeImageService';
import { t } from '../utils/i18n';

export type AIServiceProvider = 'apiyi' | 'gemini' | 'openai' | 'free' | 'auto';

const DEFAULT_PROVIDER: AIServiceProvider = 'apiyi';

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string,
  provider: AIServiceProvider = DEFAULT_PROVIDER
): Promise<string> => {
  if (import.meta.env.DEV) {
    console.log(`Using AI provider: ${provider}`);
  }

  // Auto mode: try providers in order of preference
  if (provider === 'auto') {
    try {
      if (import.meta.env.DEV) console.log('Attempting default image API...');
      return await generateWithApiYi(imageBase64, userPrompt);
    } catch (error) {
      if (import.meta.env.DEV) console.warn('Default image API failed, trying free services:', error);
    }

    // Note: Gemini API doesn't support image generation, skip it
    // Priority order: Free services (Hugging Face/Replicate) -> OpenAI (paid) -> Gemini (text only, skip)
    
    // Try free services first (Hugging Face/Replicate)
    const huggingfaceKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    const replicateKey = import.meta.env.VITE_REPLICATE_API_TOKEN;
    
    if (huggingfaceKey || replicateKey) {
      try {
        if (import.meta.env.DEV) console.log('Attempting free image generation...');
        return await generateWithFree(imageBase64, userPrompt);
      } catch (error) {
        if (import.meta.env.DEV) console.warn('Free service failed, trying OpenAI:', error);
      }
    }

    // Try OpenAI if key is available
    const openaiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (openaiKey) {
      try {
        if (import.meta.env.DEV) console.log('Attempting OpenAI...');
        return await generateWithOpenAI(imageBase64, userPrompt);
      } catch (error) {
        if (import.meta.env.DEV) console.warn('OpenAI failed:', error);
      }
    }

    // Last resort: Try Gemini (though it doesn't generate images)
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiKey) {
      try {
        if (import.meta.env.DEV) console.log('Attempting Google Gemini (may not support image generation)...');
        return await generateWithGemini(imageBase64, userPrompt);
      } catch (error) {
        if (import.meta.env.DEV) console.warn('Gemini failed:', error);
      }
    }

    // All services failed
    throw new Error(t('main.allServicesBusy'));
  }

  if (provider === 'apiyi') {
    return await generateWithApiYi(imageBase64, userPrompt);
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

  throw new Error(t('main.somethingWentWrong'));
};

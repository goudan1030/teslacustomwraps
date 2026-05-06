import { generateWrapDesign as generateWithApiYi } from './apiYiService';

export type AIServiceProvider = 'apiyi' | 'auto';

const DEFAULT_PROVIDER: AIServiceProvider = 'apiyi';

export const generateWrapDesign = async (
  imageBase64: string,
  userPrompt: string,
  provider: AIServiceProvider = DEFAULT_PROVIDER
): Promise<string> => {
  if (import.meta.env.DEV) {
    console.log(`Using AI provider: ${provider}`);
  }

  if (provider === 'apiyi' || provider === 'auto') {
    return await generateWithApiYi(imageBase64, userPrompt);
  }

  return await generateWithApiYi(imageBase64, userPrompt);
};

export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        // Remove the data URL prefix (e.g., "data:image/png;base64,") to get just the base64 data
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert file to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
    }
    const blob = await response.blob();
    
    // Detect MIME type from blob or URL
    let mimeType = blob.type || 'image/png';
    if (!mimeType || mimeType === 'application/octet-stream') {
      // Try to infer from URL extension
      if (url.endsWith('.png')) {
        mimeType = 'image/png';
      } else if (url.endsWith('.jpg') || url.endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (url.endsWith('.webp')) {
        mimeType = 'image/webp';
      }
    }
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Return just the base64 data without the data URL prefix
          const base64 = reader.result.split(',')[1];
          if (!base64) {
            reject(new Error('Failed to extract base64 data from result'));
            return;
          }
          resolve(base64);
        } else {
          reject(new Error('Failed to convert URL to base64: reader result is not a string'));
        }
      };
      reader.onerror = (error) => {
        reject(new Error(`FileReader error: ${error}`));
      };
    });
  } catch (error: any) {
    console.error('Error in urlToBase64:', error);
    throw new Error(`Failed to load image from ${url}: ${error.message}`);
  }
};

/**
 * Converts a base64 string (with or without data URL prefix) to a data URL
 * @param base64 - Base64 string, with or without "data:image/png;base64," prefix
 * @param mimeType - MIME type for the image (default: 'image/png')
 * @returns Complete data URL string
 */
export const base64ToDataUrl = (base64: string, mimeType: string = 'image/png'): string => {
  if (!base64) {
    return '';
  }
  
  // If it already contains the data URL prefix, return as is
  if (base64.includes('data:')) {
    return base64;
  }
  
  // Otherwise, add the prefix
  return `data:${mimeType};base64,${base64}`;
};

export const SAMPLE_TEMPLATE_URL = "https://i.imgur.com/k6lP09B.png"; // Using a placeholder that looks like the prompt or similar wireframe for demo purposes if user doesn't upload. 
// However, since I cannot guarantee the prompt image URL is public/persistent, I will handle the user upload primarily. 
// For the purpose of this demo, I'll allow the user to use a "Sample" which fetches a known wireframe, 
// or the user uploads the specific one from the prompt.

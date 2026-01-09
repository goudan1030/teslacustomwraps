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
  const response = await fetch(url);
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => {
      if (typeof reader.result === 'string') {
         const base64 = reader.result.split(',')[1];
        resolve(base64);
      } else {
        reject(new Error('Failed to convert URL to base64'));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const SAMPLE_TEMPLATE_URL = "https://i.imgur.com/k6lP09B.png"; // Using a placeholder that looks like the prompt or similar wireframe for demo purposes if user doesn't upload. 
// However, since I cannot guarantee the prompt image URL is public/persistent, I will handle the user upload primarily. 
// For the purpose of this demo, I'll allow the user to use a "Sample" which fetches a known wireframe, 
// or the user uploads the specific one from the prompt.

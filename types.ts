export interface GenerationConfig {
  prompt: string;
  image: string; // Base64 string
}

export interface GenerationResult {
  imageUrl: string;
  error?: string;
}

export enum AppState {
  IDLE = 'IDLE',
  GENERATING = 'GENERATING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}
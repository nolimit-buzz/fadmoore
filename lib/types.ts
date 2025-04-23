// Type definitions for the application

export type UploadFile = {
  file: File;
  name: string;
  size: number;
  type: string;
};

export type ProcessingState = 'idle' | 'processing' | 'completed' | 'error';

export type AnalysisResult = {
  resultUrl: string;
  insights?: Record<string, any>;
};
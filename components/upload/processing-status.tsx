"use client";

import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadFile, ProcessingState } from '@/lib/types';

interface ProcessingStatusProps {
  file: UploadFile | null;
  processingState: ProcessingState;
  progress: number;
  onProcess: () => void;
}

export default function ProcessingStatus({ 
  file, 
  processingState, 
  progress, 
  onProcess 
}: ProcessingStatusProps) {
  
  if (!file?.name) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      {processingState === 'processing' && (
        <div className="space-y-3 scale-in">
          <div className="flex flex-col items-center justify-center">
            <div className="relative w-24 h-24">
              {/* Background circle */}
              <div className="absolute inset-0 rounded-full border-4 border-secondary" />
              {/* Progress circle */}
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-primary transition-all duration-300 ease-in-out"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  r="48"
                  cx="50"
                  cy="50"
                  style={{
                    strokeDasharray: `${2 * Math.PI * 48}`,
                    strokeDashoffset: `${2 * Math.PI * 48 * (1 - progress / 100)}`,
                  }}
                />
              </svg>
              {/* Progress text */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-semibold text-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground mt-4">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>
                {progress < 30 && "Extracting document content..."}
                {progress >= 30 && progress < 60 && "Analyzing with AI..."}
                {progress >= 60 && progress < 90 && "Generating insights..."}
                {progress >= 90 && "Preparing results..."}
              </span>
            </div>
          </div>
        </div>
      )}
      
      {processingState === 'idle' && (
        <Button
          onClick={onProcess}
          className="w-full"
          size="lg"
        >
          Analyze Document
        </Button>
      )}
      
      {processingState === 'error' && (
        <div className="text-center py-4 space-y-4">
          <div className="bg-destructive/10 rounded-full p-3 inline-flex">
            <AlertTriangle className="h-8 w-8 text-destructive" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-foreground mb-1">Processing Error</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We encountered an error while processing your document. Please try again.
            </p>
            <Button onClick={onProcess} variant="outline">
              Retry
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
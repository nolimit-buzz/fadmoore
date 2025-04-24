"use client";

import { useState } from 'react';
import { FileUploader } from './file-uploader';
import ProcessingStatus from './processing-status';
import ResultView from './result-view';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UploadFile, ProcessingState } from '@/lib/types';

export default function UploadSection() {
  const [file, setFile] = useState<UploadFile | null>(null);
  const [prompt, setPrompt] = useState<string>('');
  const [processingState, setProcessingState] = useState<ProcessingState>('idle');
  const [progress, setProgress] = useState<number>(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [excelData, setExcelData] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  
  const handleFileUpload = (uploadedFile: UploadFile) => {
    setFile(uploadedFile);
    setProcessingState('idle');
    setResultUrl(null);
  };
  
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };
  
  const handleProcessFile = async () => {
    if (!file) return;
    
    try {
      setProcessingState('processing');
      setProgress(0);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          // Slower initial progress (0-30%)
          if (prev < 30) {
            return prev + Math.random() * 4;
          }
          // Medium progress (30-70%)
          if (prev < 70) {
            return prev + Math.random() * 3;
          }
          // Slower final progress (70-95%)
          return prev + Math.random() * 2;
        });
      }, 1000);
      
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('prompt', prompt);
      
      // Make API request
      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to process file');
      }

      const data = await response.json();
      
      // Clear the progress interval
      clearInterval(progressInterval);
      
      if (data.excelData && data.filename) {
        setResultUrl(data.resultUrl);
        setExcelData(data.excelData);
        setFilename(data.filename);
        setProgress(100);
        setProcessingState('completed');
      } else {
        throw new Error('Invalid response format');
      }
            
    } catch (error) {
      console.error('Error processing file:', error);
      setProcessingState('error');
      setProgress(0);
    }
  };
  
  const resetUpload = () => {
    setFile(null);
    setPrompt('');
    setProcessingState('idle');
    setProgress(0);
    setResultUrl(null);
  };
  
  return (
    <Card className="bg-card shadow-lg border-border overflow-hidden">
      <CardContent className="p-6 md:p-8">
        {processingState === 'completed' && resultUrl ? (
          <ResultView 
            resultUrl={resultUrl} 
            excelData={excelData}
            filename={filename}
            onReset={resetUpload} 
          />
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <FileUploader 
                onFileUpload={handleFileUpload} 
                currentFile={file}
                disabled={processingState === 'processing'}
              />
              
              <div className="space-y-2">
                <Label htmlFor="prompt">Additional Instructions (Optional)</Label>
                <Textarea
                  id="prompt"
                  placeholder="Enter any specific instructions or questions about the document..."
                  value={prompt}
                  onChange={handlePromptChange}
                  disabled={processingState === 'processing'}
                  className="min-h-[100px] resize-y bg-[#878f9711] border-[#878f9711]"
                />
              </div>
            </div>
            
            <ProcessingStatus
              file={file}
              processingState={processingState}
              progress={progress}
              onProcess={handleProcessFile}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
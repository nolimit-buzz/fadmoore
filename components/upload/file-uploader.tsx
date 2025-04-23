"use client";

import { useRef, useState, useCallback } from 'react';
import { FileTextIcon, UploadCloudIcon, XCircleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UploadFile } from '@/lib/types';

interface FileUploaderProps {
  onFileUpload: (file: UploadFile) => void;
  currentFile: UploadFile | null;
  disabled?: boolean;
}

export function FileUploader({ onFileUpload, currentFile, disabled = false }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0] && !disabled) {
      processFile(e.dataTransfer.files[0]);
    }
  }, [disabled]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };
  
  const processFile = (file: File) => {
    // Check file type (PDF, DOCX, etc.)
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF, DOCX, or TXT file');
      return;
    }
    
    // Process and upload the file
    const uploadFile: UploadFile = {
      file,
      name: file.name,
      size: file.size,
      type: file.type,
    };
    
    onFileUpload(uploadFile);
  };
  
  const removeFile = () => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    onFileUpload({
      file: new File([], ''),
      name: '',
      size: 0,
      type: '',
    });
  };
  
  return (
    <div className="space-y-4">
      {!currentFile?.name ? (
        <div
          className={`dropzone ${dragActive ? 'active' : ''} p-8 text-center flex flex-col items-center justify-center h-64 cursor-pointer transition-all duration-200 ease-in-out ${disabled ? 'opacity-70 cursor-not-allowed' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.docx,.txt"
            disabled={disabled}
          />
          
          <UploadCloudIcon size={50} className="text-primary/60 mb-4" />
          <p className="text-lg font-medium mb-2">Drag & Drop files here to upload</p>
          <p className="text-sm text-muted-foreground mb-4">or click to browse files</p>
          <Button
            type="button"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) inputRef.current?.click();
            }}
            disabled={disabled}
          >
            Browse Files
          </Button>
          <p className="text-xs text-muted-foreground mt-4">
            Supported formats: PDF, DOCX, TXT
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-lg p-4 flex items-center justify-between fade-in">
          <div className="flex items-center">
            <div className="bg-primary/10 rounded-full p-2 mr-3">
              <FileTextIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-medium text-foreground">{currentFile.name}</p>
              <p className="text-xs text-muted-foreground">
                {(currentFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={removeFile}
            disabled={disabled}
            className="text-muted-foreground hover:text-destructive"
          >
            <XCircleIcon className="h-5 w-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
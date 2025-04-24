"use client";

import { useState } from 'react';
import { Download, CheckCircle, ArrowLeft, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ResultViewProps {
  resultUrl: string | null;
  excelData: string | null;
  filename: string | null;
  onReset: () => void;
}

export default function ResultView({ resultUrl, excelData, filename, onReset }: ResultViewProps) {
  const [copied, setCopied] = useState(false);
  
  const handleDownload = () => {
    if (!excelData || !filename) return;
    
    try {
      const link = document.createElement('a');
      link.href = `data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,${excelData}`;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };
  
  return (
    <div className="text-center py-6 space-y-8 scale-in">
      <div className="inline-flex flex-col items-center">
        <div className="bg-primary/10 rounded-full p-4 mb-4">
          <CheckCircle className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-2xl font-bold text-foreground mb-2">Analysis Complete!</h3>
        <p className="text-muted-foreground max-w-lg mx-auto">
          We've analyzed your document and created a detailed insights report. You can download it now or start a new analysis.
        </p>
      </div>
      
      <Card className="p-6 max-w-md mx-auto bg-secondary/50">
        <div className="flex flex-col space-y-4">
          <h4 className="text-md font-medium">Insight Report Ready</h4>
          <p className="text-sm text-muted-foreground">
            Your XLSX file contains valuable insights about the document analysis.
          </p>
          
          <div className="flex flex-col space-y-2">
            <Button 
              onClick={handleDownload}
              size="lg"
              className="w-full flex items-center justify-center"
            >
              <Download className="mr-2 h-5 w-5" />
              Download XLSX Report
            </Button>
            
            {/* <Button 
              variant="outline"
              onClick={() => resultUrl && window.open(resultUrl, '_blank', 'noopener,noreferrer')}
              size="lg"
              className="w-full flex items-center justify-center"
              disabled={!resultUrl}
            >
              <Eye className="mr-2 h-5 w-5" />
              Preview Report
            </Button> */}
          </div>
        </div>
      </Card>
      
      <Button 
        variant="outline" 
        onClick={onReset}
        className="flex items-center"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Analyze Another Document
      </Button>
    </div>
  );
}
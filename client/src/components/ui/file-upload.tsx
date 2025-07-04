import React, { useState, useRef } from 'react';
import { Button } from './button';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove?: () => void;
  selectedFile?: File | null;
  fileUrl?: string;
  fileName?: string;
  accept?: string;
  maxSize?: number; // in MB
  className?: string;
  buttonText?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  fileUrl,
  fileName,
  accept = '.pdf',
  maxSize = 10, // 10MB default max size
  className,
  buttonText = 'Upload file'
}: FileUploadProps) {
  const [error, setError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file?: File) => {
    setError('');
    
    if (!file) return;
    
    // Check file type
    if (accept && !file.type.includes('pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    
    // Check file size
    if (maxSize && file.size > maxSize * 1024 * 1024) {
      setError(`File is too large. Maximum size is ${maxSize}MB.`);
      return;
    }
    
    onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onFileRemove?.();
  };

  // Show if a file is selected or if there's a file URL
  const hasFile = selectedFile || fileUrl;

  return (
    <div className={cn('w-full', className)}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept={accept}
        className="hidden"
      />
      
      {!hasFile ? (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
            isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground font-medium">
            Drag and drop a file here, or click to select
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports {accept.replace(/\./g, '').toUpperCase()} (Max {maxSize}MB)
          </p>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation(); 
              triggerFileInput();
            }}
          >
            {buttonText}
          </Button>
        </div>
      ) : (
        <div className="border rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="text-sm">
                <p className="font-medium truncate max-w-[200px]">
                  {selectedFile?.name || fileName || 'Document.pdf'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)}MB` : ''}
                </p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={removeFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {fileUrl && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault();
                  window.open(fileUrl, '_blank');
                }}
              >
                View PDF
              </Button>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center mt-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4 mr-1" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
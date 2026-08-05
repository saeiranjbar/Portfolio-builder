'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { imageToBase64 } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';


interface ImageUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

// Check if value is a valid image URL or base64 string
function isValidImageUrl(value: string): boolean {
  if (!value) return false;
  // Check for base64 image
  if (value.startsWith('data:image/')) return true;
  // Check for common image URL patterns
  if (value.startsWith('http://') || value.startsWith('https://')) {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => value.toLowerCase().includes(ext)) || true;
  }
  return false;
}

export function ImageUploader({ value, onChange, className }: ImageUploaderProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const base64 = await imageToBase64(file);
      onChange(base64);
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: 1,
  });

  const hasValidImage = isValidImageUrl(value);

  return (
    <div className={cn('relative', className)}>
      {hasValidImage ? (
        <div className="relative group">
          <OptimizedImage
            src={value}
            alt="Uploaded"
            className="w-full h-40 object-cover rounded-2xl border border-gray-200"
            width={400} height={160}
          />

          <button
            onClick={() => onChange('')}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            {isDragActive ? (
              <Upload className="w-8 h-8 text-blue-500" />
            ) : (
              <ImageIcon className="w-8 h-8 text-gray-400" />
            )}
            <p className="text-sm text-gray-700">
              {isDragActive
                ? 'Drop the image here...'
                : 'Drag & drop an image, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              Supports: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

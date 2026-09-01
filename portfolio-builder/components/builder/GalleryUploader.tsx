'use client';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Image as ImageIcon, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { imageToBase64 } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';
import { GalleryImage } from '@/lib/types';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface GalleryUploaderProps {
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  className?: string;
  maxImages?: number;
}

export function GalleryUploader({ images, onChange, className, maxImages = 20 }: GalleryUploaderProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newImages: GalleryImage[] = [];
    for (const file of acceptedFiles) {
      if (images.length + newImages.length >= maxImages) break;
      const base64 = await imageToBase64(file);
      // Capture natural image dimensions for aspect-ratio calculations
      const dims = await new Promise<{ width: number; height: number }>((resolve) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = () => resolve({ width: 0, height: 0 });
        img.src = base64;
      });
      newImages.push({ id: generateId(), url: base64, caption: '', naturalWidth: dims.width, naturalHeight: dims.height });
    }
    onChange([...images, ...newImages]);
  }, [images, onChange, maxImages]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    },
    maxFiles: maxImages,
  });

  const handleRemove = (id: string) => {
    onChange(images.filter(img => img.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(images.map(img => img.id === id ? { ...img, caption } : img));
  };

  const canAddMore = images.length < maxImages;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <OptimizedImage
                src={img.url}
                alt={img.caption || 'Gallery image'}
                className="w-full h-32 object-cover rounded-lg border border-gray-200"
                width={200} height={128}
              />
              <button
                onClick={() => handleRemove(img.id)}
                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                value={img.caption || ''}
                onChange={(e) => handleCaptionChange(img.id, e.target.value)}
                placeholder="Caption (optional)"
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
              />
            </div>
          ))}
        </div>
      )}

      {/* Upload area */}
      {canAddMore && (
        <div
          {...getRootProps()}
          className={cn(
            'border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-colors',
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-1.5">
            {isDragActive ? (
              <Upload className="w-6 h-6 text-blue-500" />
            ) : (
              <div className="flex items-center gap-1.5">
                <Plus className="w-5 h-5 text-gray-400" />
                <ImageIcon className="w-5 h-5 text-gray-400" />
              </div>
            )}
            <p className="text-sm text-gray-700">
              {isDragActive
                ? 'Drop images here...'
                : images.length === 0
                ? 'Drag & drop images, or click to select'
                : 'Add more images'}
            </p>
            <p className="text-xs text-gray-500">
              {images.length}/{maxImages} images • Supports: JPG, PNG, GIF, WebP
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

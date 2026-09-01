'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Video as VideoIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { videoToBase64 } from '@/lib/utils';

interface VideoFileUploaderProps {
  value: string;
  onChange: (url: string) => void;
  className?: string;
}

export function VideoFileUploader({ value, onChange, className }: VideoFileUploaderProps) {
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setLoading(true);
      try {
        const base64 = await videoToBase64(file);
        onChange(base64);
      } catch (err) {
        console.error('Video upload error:', err);
      } finally {
        setLoading(false);
      }
    }
  }, [onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/mp4': ['.mp4'],
      'video/webm': ['.webm'],
      'video/ogg': ['.ogv'],
      'video/quicktime': ['.mov'],
    },
    maxFiles: 1,
  });

  const hasVideo = value && (value.startsWith('data:video/') || value.startsWith('http') || value.startsWith('blob:'));

  return (
    <div className={cn('relative', className)}>
      {hasVideo ? (
        <div className="relative group">
          <video
            src={value}
            className="w-full h-40 object-cover rounded-2xl border border-gray-200"
            muted
            loop
            autoPlay
            playsInline
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
            {loading ? (
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            ) : isDragActive ? (
              <Upload className="w-8 h-8 text-blue-500" />
            ) : (
              <VideoIcon className="w-8 h-8 text-gray-400" />
            )}
            <p className="text-sm text-gray-700">
              {loading
                ? 'Uploading video...'
                : isDragActive
                  ? 'Drop the video here...'
                  : 'Drag & drop a video, or click to select'}
            </p>
            <p className="text-xs text-gray-500">
              Supports: MP4, WebM, OGG, MOV
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

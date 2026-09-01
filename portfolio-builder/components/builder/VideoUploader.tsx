'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Video as VideoIcon, Plus, Link2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { videoToBase64 } from '@/lib/utils';
import { GalleryVideo } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const generateId = () => Math.random().toString(36).substr(2, 9);

interface VideoUploaderProps {
  videos: GalleryVideo[];
  onChange: (videos: GalleryVideo[]) => void;
  className?: string;
  maxVideos?: number;
}

// Extract video ID from YouTube/Vimeo URLs
const extractVideoId = (url: string): { id: string; type: 'youtube' | 'vimeo' | null } => {
  const trimmed = url.trim();

  // YouTube: handle multiple URL formats
  // 1. youtu.be/VIDEO_ID
  const shortMatch = trimmed.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
  if (shortMatch) return { id: shortMatch[1], type: 'youtube' };

  // 2. youtube.com/watch?v=VIDEO_ID (with optional extra params)
  const watchMatch = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
  if (watchMatch && trimmed.includes('youtube.com')) return { id: watchMatch[1], type: 'youtube' };

  // 3. youtube.com/embed/VIDEO_ID
  const embedMatch = trimmed.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]+)/);
  if (embedMatch) return { id: embedMatch[1], type: 'youtube' };

  // 4. youtube.com/shorts/VIDEO_ID
  const shortsMatch = trimmed.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]+)/);
  if (shortsMatch) return { id: shortsMatch[1], type: 'youtube' };

  // 5. youtube.com/live/VIDEO_ID
  const liveMatch = trimmed.match(/youtube\.com\/live\/([a-zA-Z0-9_-]+)/);
  if (liveMatch) return { id: liveMatch[1], type: 'youtube' };

  // 6. youtube.com/v/VIDEO_ID
  const vMatch = trimmed.match(/youtube\.com\/v\/([a-zA-Z0-9_-]+)/);
  if (vMatch) return { id: vMatch[1], type: 'youtube' };

  // Vimeo: https://vimeo.com/xxxxx or player.vimeo.com/video/xxxxx
  const vimeoMatch = trimmed.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { id: vimeoMatch[1], type: 'vimeo' };

  return { id: '', type: null };
};


const getEmbedUrl = (url: string, type: 'youtube' | 'vimeo'): string => {
  if (type === 'youtube') {
    const { id } = extractVideoId(url);
    return `https://www.youtube.com/embed/${id}`;
  } else if (type === 'vimeo') {
    const { id } = extractVideoId(url);
    return `https://player.vimeo.com/video/${id}`;
  }
  return url;
};

export function VideoUploader({ videos, onChange, className, maxVideos = 10 }: VideoUploaderProps) {
  const [embedUrl, setEmbedUrl] = useState('');
  const [embedError, setEmbedError] = useState('');

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newVideos: GalleryVideo[] = [];
    for (const file of acceptedFiles) {
      if (videos.length + newVideos.length >= maxVideos) break;
      const base64 = await videoToBase64(file);
      newVideos.push({ id: generateId(), url: base64, type: 'uploaded', caption: '' });
    }
    onChange([...videos, ...newVideos]);
  }, [videos, onChange, maxVideos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.webm', '.mov', '.avi'],
    },
    maxFiles: maxVideos,
  });

  const handleRemove = (id: string) => {
    onChange(videos.filter(v => v.id !== id));
  };

  const handleCaptionChange = (id: string, caption: string) => {
    onChange(videos.map(v => v.id === id ? { ...v, caption } : v));
  };

  const handleAddEmbed = () => {
    setEmbedError('');
    if (!embedUrl.trim()) {
      setEmbedError('Please enter a video URL');
      return;
    }

    const { type } = extractVideoId(embedUrl);
    if (!type) {
      setEmbedError('Invalid YouTube or Vimeo URL');
      return;
    }

    if (videos.length >= maxVideos) {
      setEmbedError(`Maximum ${maxVideos} videos allowed`);
      return;
    }

    const embedLink = getEmbedUrl(embedUrl, type);
    const newVideo: GalleryVideo = {
      id: generateId(),
      url: embedLink,
      type,
      caption: ''
    };

    onChange([...videos, newVideo]);
    setEmbedUrl('');
  };

  const canAddMore = videos.length < maxVideos;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Existing videos grid */}
      {videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {videos.map((video) => (
            <div key={video.id} className="relative group">
              <div className="relative w-full bg-gray-900 rounded-lg overflow-hidden aspect-video">
                {video.type === 'youtube' ? (
                  <iframe
                    src={video.url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                ) : video.type === 'vimeo' ? (
                  <iframe
                    src={video.url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                ) : (
                  <video className="w-full h-full object-cover" controls>
                    <source src={video.url} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                )}
              </div>
              <button
                onClick={() => handleRemove(video.id)}
                className="absolute top-1.5 right-1.5 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove video"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <input
                type="text"
                value={video.caption || ''}
                onChange={(e) => handleCaptionChange(video.id, e.target.value)}
                placeholder="Caption (optional)"
                className="w-full mt-1 px-2 py-1 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-blue-400"
              />
            </div>
          ))}
        </div>
      )}

      {canAddMore && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          {/* Upload local video */}
          <div>
            <Label className="text-sm font-semibold">Upload Video</Label>
            <div
              {...getRootProps()}
              className={cn(
                'border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors mt-2',
                isDragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-1">
                <VideoIcon className="w-5 h-5 text-gray-400" />
                <p className="text-xs text-gray-700">
                  {isDragActive ? 'Drop video here...' : 'Drag & drop video or click'}
                </p>
                <p className="text-xs text-gray-500">MP4, WebM, MOV, AVI</p>
              </div>
            </div>
          </div>

          {/* Embed from YouTube/Vimeo */}
          <div>
            <Label className="text-sm font-semibold">Embed from Platform</Label>
            <div className="space-y-2 mt-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Paste YouTube or Vimeo URL"
                  value={embedUrl}
                  onChange={(e) => {
                    setEmbedUrl(e.target.value);
                    setEmbedError('');
                  }}
                  className="text-sm"
                />
                <Button
                  onClick={handleAddEmbed}
                  size="sm"
                  className="whitespace-nowrap"
                >
                  <Link2 className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              {embedError && (
                <p className="text-xs text-red-500">{embedError}</p>
              )}
            </div>
          </div>

          <p className="text-xs text-gray-500">
            {videos.length}/{maxVideos} videos
          </p>
        </div>
      )}
    </div>
  );
}

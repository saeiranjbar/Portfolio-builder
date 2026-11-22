'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Project } from '@/lib/types';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// Full-size viewer for a project card. Opening a card shows the project's photo
// or video at full size, with its title and description underneath, instead of
// the text-first detail modal. Props match ProjectDetailModal so call sites only
// change the component name.
interface ProjectLightboxProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  theme?: any;
  projects?: Project[];
  onNavigate?: (project: Project) => void;
}

function embedUrl(videoUrl: string, videoType?: string): string {
  if (videoType === 'vimeo') return videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/');
  if (videoType === 'loom') return videoUrl.replace('loom.com/share/', 'loom.com/embed/');
  return videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
}

export function ProjectLightbox({ project, isOpen, onClose }: ProjectLightboxProps) {
  const [index, setIndex] = React.useState(0);

  // Media list: cover first, then any extra project images (deduplicated).
  const media = React.useMemo(() => {
    if (!project) return [] as { url: string; caption?: string }[];
    const items: { url: string; caption?: string }[] = [];
    if (project.imageUrl) items.push({ url: project.imageUrl });
    for (const img of project.images ?? []) {
      if (img.url && !items.some((m) => m.url === img.url)) items.push({ url: img.url, caption: img.caption });
    }
    return items;
  }, [project]);

  React.useEffect(() => { setIndex(0); }, [project?.id]);

  const count = media.length;
  const next = React.useCallback(() => setIndex((i) => (count ? (i + 1) % count : 0)), [count]);
  const prev = React.useCallback(() => setIndex((i) => (count ? (i - 1 + count) % count : 0)), [count]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') next();
      else if (event.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, onClose, next, prev]);

  if (!isOpen || !project || typeof document === 'undefined') return null;

  const current = media[index];
  const showVideo = Boolean(project.videoUrl) && index === 0;
  const description = project.fullDescription || project.description;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      className="fixed inset-0 z-[9999] flex flex-col bg-black/95 text-white"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Close"
        title="Close"
        className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
        onClick={(event) => { event.stopPropagation(); onClose(); }}
      >
        <X className="h-7 w-7" />
      </button>

      {/* Media, full size */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center p-4 md:p-10" onClick={(event) => event.stopPropagation()}>
        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous image"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black/80"
              onClick={prev}
            >
              <ChevronLeft className="h-7 w-7" />
            </button>
            <button
              type="button"
              aria-label="Next image"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black/80"
              onClick={next}
            >
              <ChevronRight className="h-7 w-7" />
            </button>
          </>
        )}

        {showVideo ? (
          <div className="aspect-video w-full max-w-6xl">
            <iframe
              src={embedUrl(project.videoUrl as string, project.videoType)}
              className="h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title={project.title}
            />
          </div>
        ) : current ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={current.url}
            alt={current.caption || project.title}
            className="max-h-full max-w-full object-contain"
            style={{ maxHeight: '70vh' }}
          />
        ) : null}
      </div>

      {/* Description below the media */}
      <div className="max-h-[32vh] overflow-y-auto border-t border-white/10 bg-black/80 px-6 py-5 md:px-12" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto max-w-4xl">
          <h2 className="text-xl font-semibold md:text-2xl">{project.title}</h2>
          {current?.caption && <p className="mt-1 text-sm text-white/70">{current.caption}</p>}
          {description && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-white/85 md:text-base">{description}</p>}
          {count > 1 && <p className="mt-3 text-xs text-white/50">{index + 1} / {count}</p>}
        </div>
      </div>
    </div>,
    document.body,
  );
}

'use client';

import React from 'react';
import { createPortal } from 'react-dom';
import { Project } from '@/lib/types';
import { X, ExternalLink, Calendar, User, Tag, ChevronLeft, ChevronRight, ZoomIn, Share2 } from 'lucide-react';
import { OptimizedImage } from './OptimizedImage';
import { MediaBlockRenderer } from './MediaBlocks';


interface ProjectDetailModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
  theme: any;
  projects?: Project[]; // All projects for prev/next navigation
  onNavigate?: (project: Project) => void; // Callback when navigating to another project
}

export function ProjectDetailModal({ project, isOpen, onClose, theme, projects = [], onNavigate }: ProjectDetailModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const [showShareMenu, setShowShareMenu] = React.useState(false);

  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setCurrentImageIndex(0);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, project?.id]);

  // Compute navigation values before early return (needed for keyboard hook)
  const currentIndex = project ? projects.findIndex(p => p.id === project.id) : -1;
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : null;
  const nextProject = project && currentIndex >= 0 && currentIndex < projects.length - 1 ? projects[currentIndex + 1] : null;

  // Keep latest values in refs to avoid re-attaching the event listener
  const isLightboxOpenRef = React.useRef(isLightboxOpen);
  isLightboxOpenRef.current = isLightboxOpen;
  const onCloseRef = React.useRef(onClose);
  onCloseRef.current = onClose;

  // Keyboard navigation - must be before early return to maintain hook order
  React.useEffect(() => {
    if (!isOpen || !project) return;
    const handleKey = (e: KeyboardEvent) => {
      // Don't handle Escape if a media block lightbox is open — let it handle Escape
      if (e.key === 'Escape' && document.body.hasAttribute('data-lightbox-open')) return;
      if (e.key === 'Escape') {
        if (isLightboxOpenRef.current) setIsLightboxOpen(false);
        else onCloseRef.current();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, project]);

  if (!isOpen || !project) return null;

  const allImages = [
    ...(project.images || [])
  ];

  const handlePrev = () => {
    if (prevProject && onNavigate) onNavigate(prevProject);
  };
  const handleNext = () => {
    if (nextProject && onNavigate) onNavigate(nextProject);
  };

  // Social share
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `Check out "${project.title}" on my portfolio`;

  const shareLinks = [
    { platform: 'Twitter', url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, icon: '𝕏' },
    { platform: 'LinkedIn', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, icon: 'in' },
    { platform: 'Facebook', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, icon: 'f' },
    { platform: 'Copy Link', url: '#', icon: '🔗' },
  ];

  const handleShare = (platform: string, url: string) => {
    if (platform === 'Copy Link') {
      navigator.clipboard?.writeText(shareUrl);
      setShowShareMenu(false);
      return;
    }
    window.open(url, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      >
        <div
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
          style={{ borderRadius: theme.borderRadius }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Main image gallery - only show if there are gallery images */}
          {allImages.length > 0 && (
          <div className="relative aspect-video w-full bg-gray-100 group">
            <OptimizedImage
              src={allImages[currentImageIndex]?.url}
              alt={project.title}
              className="w-full h-full object-cover cursor-zoom-in"
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              onClick={() => setIsLightboxOpen(true)}
            />

            {/* Zoom button */}
            <button
              onClick={() => setIsLightboxOpen(true)}
              className="absolute top-4 right-16 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors opacity-0 group-hover:opacity-100"
              title="Zoom image"
            >
              <ZoomIn className="w-5 h-5" />
            </button>

            {/* Share button */}
            <div className="absolute top-4 left-4">
              <button
                onClick={() => setShowShareMenu(!showShareMenu)}
                className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
                title="Share project"
              >
                <Share2 className="w-5 h-5" />
              </button>
              {showShareMenu && (
                <div className="absolute top-12 left-0 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-1">
                  {shareLinks.map((link) => (
                    <button
                      key={link.platform}
                      onClick={() => handleShare(link.platform, link.url)}
                      className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-sm font-bold"
                      title={link.platform}
                    >
                      {link.icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {allImages[currentImageIndex]?.caption && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                <p className="text-white text-sm">{allImages[currentImageIndex].caption}</p>
              </div>
            )}
          </div>
          )}

          {/* Share button - shown when no gallery images */}
          {allImages.length === 0 && (
            <div className="relative bg-gray-50 p-4">
              <div className="absolute top-4 right-4">
                <button
                  onClick={() => setShowShareMenu(!showShareMenu)}
                  className="p-2 bg-black/10 hover:bg-black/20 rounded-full text-gray-700 transition-colors"
                  title="Share project"
                >
                  <Share2 className="w-5 h-5" />
                </button>
                {showShareMenu && (
                  <div className="absolute top-12 right-0 bg-white rounded-xl shadow-lg border border-gray-200 p-2 flex gap-1">
                    {shareLinks.map((link) => (
                      <button
                        key={link.platform}
                        onClick={() => handleShare(link.platform, link.url)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 text-sm font-bold"
                        title={link.platform}
                      >
                        {link.icon}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Image thumbnails - only show if there are multiple images */}
          {allImages.length > 1 && (
            <div className="flex gap-2 p-4 overflow-x-auto bg-gray-50">
              {allImages.map((img, index) => (
                <button
                  key={img.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-14 rounded overflow-hidden border-2 transition-all ${
                    currentImageIndex === index ? 'border-blue-500' : 'border-transparent hover:border-gray-300'
                  }`}
                >
                  <OptimizedImage src={img.url} alt="" className="w-full h-full object-cover" width={80} height={56} />
                </button>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="p-6 md:p-8">
            <h2
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ fontFamily: theme.typography.headingFont, color: theme.colors.text }}
            >
              {project.title}
            </h2>

            {/* Meta info - hidden category */}
            <div className="flex flex-wrap gap-4 mb-6 text-sm" style={{ color: theme.colors.textSecondary }}>
              {project.client && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{project.client}</span>
                </div>
              )}
              {project.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{project.date}</span>
                </div>
              )}
              {/* Category hidden */}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-6">
              {project.tags.map((tag, i) => (
                <span
                  key={i}
                  className="px-3 py-1 text-sm rounded-full"
                  style={{ backgroundColor: theme.colors.primary, color: 'white' }}
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Description */}
            <div className="prose max-w-none mb-6">
              <p style={{ color: theme.colors.text, whiteSpace: 'pre-wrap' }}>
                {project.fullDescription || project.description}
              </p>
            </div>

            {/* Case Study */}
            {project.caseStudy && (project.caseStudy.problem || project.caseStudy.process || project.caseStudy.solution || project.caseStudy.results) && (
              <div className="mb-6 space-y-4">
                <h3 className="text-xl font-bold" style={{ color: theme.colors.text }}>Case Study</h3>
                {project.caseStudy.problem && (
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: theme.colors.primary }}>Problem</h4>
                    <p style={{ color: theme.colors.textSecondary }}>{project.caseStudy.problem}</p>
                  </div>
                )}
                {project.caseStudy.process && (
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: theme.colors.primary }}>Process</h4>
                    <p style={{ color: theme.colors.textSecondary }}>{project.caseStudy.process}</p>
                  </div>
                )}
                {project.caseStudy.solution && (
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: theme.colors.primary }}>Solution</h4>
                    <p style={{ color: theme.colors.textSecondary }}>{project.caseStudy.solution}</p>
                  </div>
                )}
                {project.caseStudy.results && (
                  <div>
                    <h4 className="font-semibold mb-1" style={{ color: theme.colors.primary }}>Results</h4>
                    <p style={{ color: theme.colors.textSecondary }}>{project.caseStudy.results}</p>
                  </div>
                )}
              </div>
            )}

            {/* Media Blocks (from project editor - videos, images, text, embeds, etc.) */}
            {project.mediaBlocks && project.mediaBlocks.length > 0 && (
              <div className="mb-6 space-y-6">
                {project.mediaBlocks
                  .slice()
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((block) => {
                    try {
                      return <MediaBlockRenderer key={block.id} block={block} themeColors={theme.colors} />;
                    } catch (e) {
                      console.error('Error rendering media block:', e);
                      return null;
                    }
                  })}
              </div>
            )}

            {/* Video embed */}
            {project.videoUrl && (
              <div className="mb-6" style={{ borderRadius: theme.borderRadius, overflow: 'hidden' }}>
                {project.videoType === 'vimeo' ? (
                  <iframe
                    src={project.videoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                    className="w-full aspect-video"
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                  />
                ) : project.videoType === 'loom' ? (
                  <iframe
                    src={project.videoUrl.replace('loom.com/share/', 'loom.com/embed/')}
                    className="w-full aspect-video"
                    allowFullScreen
                  />
                ) : (
                  <iframe
                    src={project.videoUrl.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                    className="w-full aspect-video"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            )}

            {/* Link */}
            {project.link && (
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: theme.colors.primary, borderRadius: theme.borderRadius }}
              >
                View Project
                <ExternalLink className="w-4 h-4" />
              </a>
            )}

          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-sm"
          onClick={() => setIsLightboxOpen(false)}
        >
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Lightbox prev/next */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <img
            src={allImages[currentImageIndex]?.url || project.imageUrl}
            alt={project.title}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {allImages[currentImageIndex]?.caption && (
            <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/80 text-sm">
              {allImages[currentImageIndex].caption}
            </p>
          )}

          {allImages.length > 1 && (
            <p className="absolute bottom-4 right-4 text-white/60 text-xs">
              {currentImageIndex + 1} / {allImages.length}
            </p>
          )}
        </div>
      )}
    </>,
    document.body
  );
}

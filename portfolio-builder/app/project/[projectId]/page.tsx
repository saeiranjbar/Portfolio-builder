'use client';

import React, { useState, useEffect } from 'react';
import { usePortfolioStore } from '@/lib/store';
import { Project, ProjectMediaBlock } from '@/lib/types';
import { MediaBlockRenderer } from '@/components/builder/MediaBlocks';
import { OptimizedImage } from '@/components/builder/OptimizedImage';
import { ArrowLeft, ExternalLink, Calendar, User, Tag, FolderTree } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProjectPageProps {
  params: Promise<{ projectId: string }>;
}

export default function ProjectPage({ params }: ProjectPageProps) {
  const router = useRouter();
  const { portfolio } = usePortfolioStore();
  const { theme, sections } = portfolio;
  const [project, setProject] = useState<Project | null>(null);
  const [resolvedParams, setResolvedParams] = useState<{ projectId: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    params.then(setResolvedParams);
  }, [params]);

  useEffect(() => {
    if (resolvedParams?.projectId) {
      const projectsSection = sections.find(s => s.type === 'projects');
      if (projectsSection && 'projects' in projectsSection) {
        const foundProject = projectsSection.projects.find(
          p => p.id === resolvedParams.projectId || p.title.toLowerCase().replace(/\s+/g, '-') === resolvedParams.projectId
        );
        setProject(foundProject || null);
      }
      setIsLoading(false);
    }
  }, [resolvedParams, sections]);

  // Show loading state on server-side render and initial client render
  if (isLoading) {

    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="mt-4 text-sm" style={{ color: theme.colors.textSecondary }}>Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: theme.colors.background }}>
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4" style={{ color: theme.colors.text }}>Project Not Found</h1>
          <p className="mb-6" style={{ color: theme.colors.textSecondary }}>The project you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: theme.colors.primary }}
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </div>
    );
  }


  const renderMediaBlocks = () => {
    if (project.mediaBlocks && project.mediaBlocks.length > 0) {
      const sortedBlocks = [...project.mediaBlocks].sort((a, b) => a.order - b.order);

      
      // Render each block as a full-width row, stacked vertically and centered
      return (
        <div className="w-full">
          {sortedBlocks.map((block: ProjectMediaBlock) => (
            <div key={block.id} className="w-full my-6">
              <MediaBlockRenderer block={block} themeColors={{ ...theme.colors, text: project.textColor || theme.colors.text }} />
            </div>
          ))}


        </div>
      );
    }

    // Fallback to legacy images array
    if (project.images && project.images.length > 0) {
      const totalImages = project.images.length;
      
      // Single image - centered
      if (totalImages === 1) {
        return (
          <div className="flex justify-center my-6 w-full">
            <div className="max-w-4xl w-full">
              <OptimizedImage
                src={project.images[0].url}
                alt={project.images[0].caption || project.title}
                className="w-full h-auto rounded-sm block"
                width={1200}
                height={800}
                style={{ maxWidth: '100%', display: 'block' }}
              />
              {project.images[0].caption && (
                <p className="text-center mt-4" style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont, fontSize: '18px' }}>
                  {project.images[0].caption}
                </p>
              )}

            </div>
          </div>
        );
      }

      
      // 2 images - centered side by side
      if (totalImages === 2) {
        return (
          <div className="flex justify-center my-6 w-full">
            <div className="grid grid-cols-2 gap-6 max-w-5xl w-full">
              {project.images.map((img) => (
                <div key={img.id}>
                  <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: '4 / 3' }}>
                    <OptimizedImage
                      src={img.url}
                      alt={img.caption || project.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                  </div>

                  {img.caption && (
                    <p className="text-center mt-2 text-sm" style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}>
                      {img.caption}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      }
      
      // 3+ images - grid with max 3 columns, centered
      return (
        <div className="flex justify-center my-6 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl w-full">
            {project.images.map((img) => (
              <div key={img.id}>
                <div className="relative w-full overflow-hidden rounded-sm" style={{ aspectRatio: '4 / 3' }}>
                  <OptimizedImage
                    src={img.url}
                    alt={img.caption || project.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover"
                  />
                </div>

                {img.caption && (
                  <p className="text-center mt-2 text-sm" style={{ color: theme.colors.textSecondary, fontFamily: theme.typography.bodyFont }}>
                    {img.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      );

    }

    return null;
  };

  // Detect if background is dark to use light scrollbar
  const bgColor = project.bgColor || '#ffffff';
  const hex = bgColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  const isDarkBg = luminance < 0.5;

  return (
    <div className={`min-h-screen ${isDarkBg ? 'dark-scrollbar' : ''}`} style={{ fontFamily: theme.typography.bodyFont, backgroundColor: project.bgColor || '#ffffff', color: project.textColor || '#000000' }}>
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 border-b" style={{ borderColor: '#e0e0e0', backgroundColor: project.bgColor || '#ffffff' }}>

        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: project.textColor || '#696969' }}
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </button>

        </div>
      </header>

      {/* Project Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* Project Header */}
        <div className="mb-12 text-center">
          <h1 
            className="text-4xl font-bold mb-4"
            style={{ fontFamily: theme.typography.bodyFont, fontSize: '32px', color: project.textColor || '#26454F', fontWeight: '600' }}
          >
            {project.title}
          </h1>
          
          {/* Project Meta */}
          {(project.client || project.date || (project.tags && project.tags.length > 0)) && (
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm" style={{ color: '#696969' }}>
              {project.client && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span><strong>Client:</strong> {project.client}</span>
                </div>
              )}
              {project.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{project.date}</span>
                </div>
              )}
              {project.tags && project.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <Tag className="w-4 h-4" />
                  {project.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 text-xs rounded"
                      style={{ 
                        backgroundColor: `${theme.colors.primary}10`, 
                        color: theme.colors.primary,
                        fontFamily: theme.typography.bodyFont
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              {project.category && (
                <div className="flex items-center gap-2 flex-wrap justify-center">
                  <FolderTree className="w-4 h-4" />
                  <span
                    className="px-2 py-0.5 text-xs rounded"
                    style={{ 
                      backgroundColor: `${theme.colors.primary}10`, 
                      color: theme.colors.primary,
                      fontFamily: theme.typography.bodyFont
                    }}
                  >
                    {project.category}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Full Description */}
        {project.fullDescription && (
          <div 
            className="mb-12 max-w-3xl mx-auto text-center"
            style={{ fontFamily: theme.typography.bodyFont, fontSize: '17px', lineHeight: '1.8', color: '#696969' }}
            dangerouslySetInnerHTML={{ __html: project.fullDescription }}
          />
        )}

        {/* Case Study Sections */}
        {project.caseStudy && (
          <div className="mb-12 space-y-12">
            {project.caseStudy.problem && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-center" style={{ color: '#696969', fontFamily: theme.typography.bodyFont }}>
                  Problem
                </h2>
                <p className="text-base leading-relaxed text-center" style={{ color: '#696969', fontFamily: theme.typography.bodyFont }}>
                  {project.caseStudy.problem}
                </p>
              </div>
            )}
            {project.caseStudy.process && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-center" style={{ color: '#696969', fontFamily: theme.typography.bodyFont }}>
                  Process
                </h2>
                <p className="text-base leading-relaxed text-center" style={{ color: '#696969', fontFamily: theme.typography.bodyFont }}>
                  {project.caseStudy.process}
                </p>
              </div>
            )}
            {project.caseStudy.solution && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-center" style={{ color: '#696969', fontFamily: theme.typography.bodyFont }}>
                  Solution
                </h2>
                <p className="text-base leading-relaxed text-center" style={{ color: '#696969', fontFamily: theme.typography.bodyFont }}>
                  {project.caseStudy.solution}
                </p>
              </div>
            )}
            {project.caseStudy.results && (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-2xl font-semibold mb-4 text-center" style={{ color: '#696969', fontFamily: theme.typography.bodyFont }}>
                  Results
                </h2>
                <p className="text-base leading-relaxed text-center" style={{ color: '#696969', fontFamily: theme.typography.bodyFont }}>
                  {project.caseStudy.results}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Media Blocks / Additional Images */}
        {renderMediaBlocks()}

        {/* Video - Centered */}
        {project.videoUrl && (
          <div className="my-12 flex justify-center">
            <div className="aspect-video w-full max-w-4xl">
              {project.videoType === 'youtube' ? (
                <iframe
                  src={`https://www.youtube.com/embed/${project.videoUrl.split('/').pop()?.split('?')[0]?.split('&')[0]}`}
                  className="w-full h-full rounded-sm"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : project.videoType === 'vimeo' ? (
                <iframe
                  src={`https://player.vimeo.com/video/${project.videoUrl.split('/').pop()}`}
                  className="w-full h-full rounded-sm"
                  frameBorder="0"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  controls
                  className="w-full rounded-sm"
                  style={{ maxWidth: '100%', maxHeight: '675px' }}
                >
                  <source src={project.videoUrl} />
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          </div>
        )}

        {/* Project Link CTA */}
        {project.link && (
          <div className="mt-16 pt-8 border-t text-center" style={{ borderColor: '#e0e0e0' }}>
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-medium text-white text-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: theme.colors.primary }}
            >
              View Live Project
              <ExternalLink className="w-5 h-5" />
            </a>
          </div>
        )}
      </main>

      {/* Footer Spacing */}
      <div className="h-20" />
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';

import { useRouter } from 'next/navigation';
import { usePortfolioStore } from '@/lib/store';
import { SimpleLayoutConfig, SocialLink, Experience, Project, HeroSection, AboutSection, ContactSection, ProjectsSection } from '@/lib/types';

import { 
  Linkedin, Instagram, Twitter, Github, Dribbble, Globe, 
  ExternalLink, MapPin, Briefcase, GraduationCap, Users, Heart, Eye,
  ArrowLeft, X, FileText, Download, CheckCircle, Mail, Phone, Plus, Trash2,
  Building2
} from 'lucide-react';

import { OptimizedImage } from './OptimizedImage';
import { ProjectEditor } from './ProjectEditor';
import { SectionRenderer } from './PortfolioPreview';
import { SectionEditor } from './SectionEditor';

// Custom SVG icons for Behance and Pinterest (not available in lucide-react)
const BehanceIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 7h-7V5h7v2zm1.726 10c-.442 1.297-2.029 3-5.101 3-3.074 0-5.564-1.729-5.564-5.675 0-3.91 2.325-5.92 5.466-5.92 3.082 0 4.964 1.782 5.375 4.426.078.506.109 1.188.095 2.14H15.97c.13 3.211 3.483 3.312 4.588 2.029h3.168zm-7.686-4h4.965c-.105-1.547-1.136-2.219-2.477-2.219-1.466 0-2.277.768-2.488 2.219zm-9.854 6.924H0V5.021h6.083c3.051.038 5.187 1.078 5.187 4.109 0 1.547-.846 2.732-2.119 3.292 1.697.479 2.626 1.876 2.626 3.75 0 3.375-2.488 4.625-5.979 4.625zM3.022 11.5h2.935c1.234 0 2.038-.625 2.038-1.75 0-1.375-.875-1.75-2.038-1.75H3.022v3.5zm0 5.5h3.063c1.375 0 2.25-.625 2.25-2 0-1.5-.875-2-2.25-2H3.022v4z"/>
  </svg>
);

const PinterestIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.464-6.217 7.464-1.214 0-2.357-.629-2.748-1.378l-.747 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/>
  </svg>
);






interface BehanceLayoutProps {
  onEditProject?: (project: Project) => void;
  onAddProject?: () => void;
  isEditMode?: boolean;
}

export function BehanceLayout({ onEditProject, onAddProject, isEditMode = true }: BehanceLayoutProps) {
  const router = useRouter();
  const { portfolio, updateSection, updateSimpleLayout, selectSection, selectedSectionId } = usePortfolioStore();
  const { theme, sections, simpleLayout } = portfolio;
  const [isEditing, setIsEditing] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [inlineEditingSectionId, setInlineEditingSectionId] = useState<string | null>(null);
  const [sidebarEditingSection, setSidebarEditingSection] = useState<string | null>(null);


  // Auto-open inline editor when a section is selected (e.g., after being added via "+" button)
  useEffect(() => {
    if (isEditMode && selectedSectionId) {
      // Only auto-open for sections that are rendered in the main content area
      // (not hero, about, contact, or projects which have their own editors)
      const section = sections.find(s => s.id === selectedSectionId);
      if (section && !['hero', 'about', 'contact', 'projects'].includes(section.type)) {
        setInlineEditingSectionId(selectedSectionId);
      }
    }
  }, [selectedSectionId, isEditMode, sections]);

  // Close project editor when preview mode is toggled
  const previewMode = usePortfolioStore(s => s.previewMode);
  useEffect(() => {
    if (previewMode) {
      setIsEditing(false);
      setEditingProject(undefined);
      setInlineEditingSectionId(null);
    }
  }, [previewMode]);







  // Don't use parent callbacks - handle everything internally for simple mode
  const handleAddProjectInternal = () => {
    setEditingProject(undefined);
    setIsEditing(true);
  };

  const handleEditProjectInternal = (project: Project) => {
    setEditingProject(project);
    setIsEditing(true);
  };
  
  const config: SimpleLayoutConfig = simpleLayout || {
    showSidebar: true,
    sidebarPosition: 'left',
    profileImage: '',
    profileName: portfolio.metadata.title,
    profileTitle: 'Creative Professional',
    profileLocation: '',
    availableForWork: true,
    availabilityText: 'Available for work',
    showStats: true,
    projectViews: 0,
    appreciations: 0,
    followers: 0,
    following: 0,
    sidebarSocialLinks: [],
    sidebarExperiences: [],
    sidebarAbout: '',
  };

  // Get Hero, About, and Contact sections for sidebar
  const heroSection = sections.find(s => s.type === 'hero') as HeroSection | undefined;
  const aboutSection = sections.find(s => s.type === 'about') as AboutSection | undefined;
  const contactSection = sections.find(s => s.type === 'contact') as ContactSection | undefined;
  const projectsSection = sections.find(s => s.type === 'projects');
  const projects: Project[] = projectsSection?.type === 'projects' ? projectsSection.projects : [];

  const getSocialIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="w-3.5 h-3.5" />;
      case 'github': return <Github className="w-3.5 h-3.5" />;
      case 'twitter': return <Twitter className="w-3.5 h-3.5" />;
      case 'instagram': return <Instagram className="w-3.5 h-3.5" />;
      case 'dribbble': return <Dribbble className="w-3.5 h-3.5" />;
      case 'behance': return <Globe className="w-3.5 h-3.5" />;
      case 'website': return <Globe className="w-3.5 h-3.5" />;
      default: return <ExternalLink className="w-3.5 h-3.5" />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  // Handle project click - check isEditMode to determine behavior
  const handleProjectClick = (project: Project) => {
    if (isEditMode) {
      // In edit mode, open the editor
      setEditingProject(project);
      setIsEditing(true);
    } else {
      // In preview mode, navigate to project detail page
      const projectSlug = project.title.toLowerCase().replace(/\s+/g, '-');
      router.push(`/project/${projectSlug}`);
    }
  };

  // Handle add project - open editor (always use internal editor, not parent callback)
  const handleAddProject = () => {
    setEditingProject(undefined);
    setIsEditing(true);
  };

  // Handle edit project - open editor with existing project (always use internal editor)
  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setIsEditing(true);
  };

  // Handle save project — shouldExit controls whether to close the editor
  const handleSaveProject = (project: Project, shouldExit?: boolean) => {
    // Update portfolio store with the new/updated project
    const projectsSection = sections.find(s => s.type === 'projects') as ProjectsSection | undefined;
    if (projectsSection) {
      const existingIndex = projectsSection.projects.findIndex(p => p.id === project.id);
      let updatedProjects;
      if (existingIndex >= 0) {
        // Update existing project in place
        updatedProjects = [...projectsSection.projects];
        updatedProjects[existingIndex] = project;
      } else {
        // Add new project
        updatedProjects = [...projectsSection.projects, project];
      }
      // Update the section with the new projects array
      updateSection(projectsSection.id, { projects: updatedProjects });
    } else {
      // No projects section exists, create one
      const { addSection } = usePortfolioStore.getState();
      addSection('projects');
      // Wait for section to be created then update it
      setTimeout(() => {
        const newSection = usePortfolioStore.getState().portfolio.sections.find(s => s.type === 'projects') as ProjectsSection | undefined;
        if (newSection) {
          updateSection(newSection.id, { 
            title: 'Projects',
            projects: [project],
            layout: 'grid',
            columnCount: 3,
            aspectRatio: '4:3',
            showTitle: true,
            showCategories: true,
            categories: [{ id: 'all', name: 'All Work' }],
          });
        }
      }, 100);
    }
    // Only exit the editor if shouldExit is true (or undefined for backward compat)
    if (shouldExit !== false) {
      setIsEditing(false);
      setEditingProject(undefined);
    } else {
      // Stay in editor — update the editing project so subsequent saves work
      setEditingProject(project);
    }
  };

  // Handle delete project
  const handleDeleteProject = (projectId: string) => {
    const projectsSection = sections.find(s => s.type === 'projects') as ProjectsSection | undefined;
    if (projectsSection) {
      const updatedProjects = projectsSection.projects.filter(p => p.id !== projectId);
      updateSection(projectsSection.id, { projects: updatedProjects });
    }
  };

  // Show project editor when in editing mode
  if (isEditing) {
    return (
      <ProjectEditor
        project={editingProject}
        onSave={handleSaveProject}
        onCancel={() => {
          setIsEditing(false);
          setEditingProject(undefined);
        }}
        theme={theme}
      />
    );
  }

  const sidebarContent = (

    <div className="w-[600px] flex-shrink-0 h-screen sticky top-0 bg-white border-r overflow-y-auto" style={{ borderColor: '#e0e0e0' }}>
      <div className="space-y-5" style={{ paddingLeft: '100px', paddingRight: '100px', paddingTop: '24px', paddingBottom: '24px', fontFamily: 'Acumin Pro, sans-serif', fontSize: '15px' }}>



        {/* Profile Image */}
        {(config.profileImage || heroSection?.avatar) && (
          <div className="relative" style={{ width: '120px', height: '120px' }}>
            <OptimizedImage
              src={config.profileImage || heroSection?.avatar || ''}
              alt={config.profileName || heroSection?.name || 'Profile'}
              className="w-full h-full object-cover rounded-full"
              width={120}
              height={120}
            />
          </div>
        )}

        {/* Name */}
        <div>
          <h1 className="text-2xl font-bold leading-tight" style={{ color: '#050505' }}>
            {config.profileName || heroSection?.name || portfolio.metadata.title}
          </h1>
          {/* Availability Status - Behance style badge */}
          {config.availableForWork && (
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              <span className="text-xs font-medium" style={{ color: '#050505' }}>{config.availabilityText}</span>
            </div>
          )}
        </div>

        {/* Professional Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-sm" style={{ color: '#696969' }}>
            <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
            {isEditMode ? (
              <input
                type="text"
                placeholder="Add your professional title"
                value={config.profileTitle || heroSection?.title || ''}
                onChange={(e) => updateSimpleLayout({ profileTitle: e.target.value })}
                className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-sm"
                style={{ color: '#696969' }}
              />
            ) : (
              <span>{config.profileTitle || heroSection?.title}</span>
            )}
          </div>
          {/* Current Workplace */}
          <div className="flex items-center gap-2 text-sm" style={{ color: '#696969' }}>
            <Building2 className="w-3.5 h-3.5 flex-shrink-0" />
            {isEditMode ? (
              <input
                type="text"
                placeholder="Add your current workplace"
                value={config.sidebarExperiences && config.sidebarExperiences.length > 0 ? config.sidebarExperiences[0].company : ''}
                onChange={(e) => {
                  const experiences = [...(config.sidebarExperiences || [])];
                  if (experiences.length > 0) {
                    experiences[0] = { ...experiences[0], company: e.target.value };
                  } else {
                    experiences.push({
                      id: `exp-${Date.now()}`,
                      position: '',
                      company: e.target.value,
                      location: '',
                      startDate: '',
                      endDate: '',
                      description: '',
                      achievements: [],
                    });
                  }
                  updateSimpleLayout({ sidebarExperiences: experiences });
                }}
                className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-sm"
                style={{ color: '#696969' }}
              />
            ) : (
              <span>
                {config.sidebarExperiences && config.sidebarExperiences.length > 0
                  ? config.sidebarExperiences[0].company
                  : ''}
              </span>
            )}
          </div>
          {/* Address */}
          <div className="flex items-center gap-2 text-sm" style={{ color: '#696969' }}>
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            {isEditMode ? (
              <input
                type="text"
                placeholder="Add your address"
                value={config.profileLocation || contactSection?.location || ''}
                onChange={(e) => updateSimpleLayout({ profileLocation: e.target.value })}
                className="flex-1 bg-transparent border-b border-transparent hover:border-gray-300 focus:border-blue-500 outline-none text-sm"
                style={{ color: '#696969' }}
              />
            ) : (
              <span>{config.profileLocation || contactSection?.location}</span>
            )}
          </div>
        </div>


        {/* Action Buttons - Behance style */}

        <div className="flex flex-col gap-2.5 pt-1">
          <button 
            className="w-full py-2.5 px-4 rounded font-semibold text-sm transition-colors border"
            style={{ borderColor: '#0057E7', color: '#0057E7' }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#0057E710'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Message
          </button>
        </div>

        {/* Social Media Links - LinkedIn, Instagram, Pinterest, Behance (above Work Experience) */}

        <div className="flex items-center gap-4 pt-2">
          {/* LinkedIn */}
          {(() => {
            const link = config.sidebarSocialLinks?.find(l => l.platform === 'linkedin');
            const url = link?.url || '#';
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" 
                 className="transition-opacity hover:opacity-60" 
                 style={{ color: '#050505', opacity: link ? 1 : (isEditMode ? 0.4 : 0) }}
                 title={link ? 'LinkedIn' : (isEditMode ? 'Add LinkedIn link' : '')}>
                <Linkedin className="w-5 h-5" />
              </a>
            );
          })()}
          {/* Instagram */}
          {(() => {
            const link = config.sidebarSocialLinks?.find(l => l.platform === 'instagram');
            const url = link?.url || '#';
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" 
                 className="transition-opacity hover:opacity-60" 
                 style={{ color: '#050505', opacity: link ? 1 : (isEditMode ? 0.4 : 0) }}
                 title={link ? 'Instagram' : (isEditMode ? 'Add Instagram link' : '')}>
                <Instagram className="w-5 h-5" />
              </a>
            );
          })()}
          {/* Pinterest */}
          {(() => {
            const link = config.sidebarSocialLinks?.find(l => l.platform === ('pinterest' as any) || l.platform === 'website');
            const url = link?.url || '#';
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" 
                 className="transition-opacity hover:opacity-60" 
                 style={{ color: '#050505', opacity: link ? 1 : (isEditMode ? 0.4 : 0) }}
                 title={link ? 'Pinterest' : (isEditMode ? 'Add Pinterest link' : '')}>
                <PinterestIcon className="w-5 h-5" />
              </a>
            );
          })()}
          {/* Behance */}
          {(() => {
            const link = config.sidebarSocialLinks?.find(l => l.platform === ('behance' as any));
            const url = link?.url || '#';
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" 
                 className="transition-opacity hover:opacity-60" 
                 style={{ color: '#050505', opacity: link ? 1 : (isEditMode ? 0.4 : 0) }}
                 title={link ? 'Behance' : (isEditMode ? 'Add Behance link' : '')}>
                <BehanceIcon className="w-5 h-5" />
              </a>
            );
          })()}
          {/* Dribbble */}
          {(() => {
            const link = config.sidebarSocialLinks?.find(l => l.platform === 'dribbble');
            const url = link?.url || '#';
            return (
              <a href={url} target="_blank" rel="noopener noreferrer" 
                 className="transition-opacity hover:opacity-60" 
                 style={{ color: '#050505', opacity: link ? 1 : (isEditMode ? 0.4 : 0) }}
                 title={link ? 'Dribbble' : (isEditMode ? 'Add Dribbble link' : '')}>
                <Dribbble className="w-5 h-5" />
              </a>
            );
          })()}
        </div>

        {/* Work Experience */}

        <div className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#696969' }}>Work Experience</h3>
            {isEditMode && (
              <button
                onClick={() => setSidebarEditingSection(sidebarEditingSection === 'experience' ? null : 'experience')}
                className="text-xs flex items-center gap-1 hover:underline"
                style={{ color: '#0057E7' }}
              >
                <Plus className="w-3 h-3" />
                {config.sidebarExperiences && config.sidebarExperiences.length > 0 ? 'Edit' : 'Add'}
              </button>
            )}
          </div>

          {sidebarEditingSection === 'experience' ? (
            /* Inline editor for work experience */
            <div className="space-y-3">
              {(config.sidebarExperiences || []).map((exp: Experience, idx: number) => (
                <div key={exp.id} className="space-y-2 p-2 rounded border" style={{ borderColor: '#e0e0e0' }}>
                  <input
                    type="text"
                    placeholder="Position"
                    value={exp.position}
                    onChange={(e) => {
                      const updated = [...(config.sidebarExperiences || [])];
                      updated[idx] = { ...exp, position: e.target.value };
                      updateSimpleLayout({ sidebarExperiences: updated });
                    }}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: '#e0e0e0' }}
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...(config.sidebarExperiences || [])];
                      updated[idx] = { ...exp, company: e.target.value };
                      updateSimpleLayout({ sidebarExperiences: updated });
                    }}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: '#e0e0e0' }}
                  />
                  <input
                    type="text"
                    placeholder="Location"
                    value={exp.location || ''}
                    onChange={(e) => {
                      const updated = [...(config.sidebarExperiences || [])];
                      updated[idx] = { ...exp, location: e.target.value };
                      updateSimpleLayout({ sidebarExperiences: updated });
                    }}
                    className="w-full px-2 py-1 text-sm border rounded"
                    style={{ borderColor: '#e0e0e0' }}
                  />
                  <button
                    onClick={() => {
                      const updated = (config.sidebarExperiences || []).filter((_, i) => i !== idx);
                      updateSimpleLayout({ sidebarExperiences: updated });
                    }}
                    className="text-xs text-red-500 hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" /> Remove
                  </button>
                </div>
              ))}
              <button
                onClick={() => {
                  const newExp: Experience = {
                    id: `exp-${Date.now()}`,
                    position: '',
                    company: '',
                    location: '',
                    startDate: '',
                    endDate: '',
                    description: '',
                    achievements: [],
                  };
                  updateSimpleLayout({ sidebarExperiences: [...(config.sidebarExperiences || []), newExp] });
                }}
                className="text-xs flex items-center gap-1 hover:underline"
                style={{ color: '#0057E7' }}
              >
                <Plus className="w-3 h-3" /> Add Experience
              </button>
              <button
                onClick={() => setSidebarEditingSection(null)}
                className="w-full py-1.5 text-xs font-medium text-white rounded"
                style={{ backgroundColor: '#0057E7' }}
              >
                Done
              </button>
            </div>
          ) : (
            config.sidebarExperiences && config.sidebarExperiences.length > 0 && (
              <>
                <div className="space-y-4">
                  {config.sidebarExperiences.map((exp: Experience) => (
                    <div key={exp.id}>
                      <div className="text-sm font-semibold" style={{ color: '#050505' }}>
                        {exp.position}
                      </div>
                      <div className="text-sm flex items-center gap-1.5" style={{ color: '#696969' }}>
                        <span>{exp.company}</span>
                        {exp.location && (
                          <>
                            <span>—</span>
                            <span>{exp.location}</span>
                          </>
                        )}
                      </div>

                    </div>
                  ))}
                </div>

              </>
            )
          )}
        </div>

        {/* Resume Upload */}
        {isEditMode && (
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: '#696969' }}>Resume</h3>
            {config.resumeUrl ? (
              <div className="flex items-center gap-2">
                <a
                  href={config.resumeUrl}
                  download
                  className="text-sm flex items-center gap-1.5 hover:underline"
                  style={{ color: '#0057E7' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Resume
                </a>
                <button
                  onClick={() => updateSimpleLayout({ resumeUrl: '' })}
                  className="text-xs text-red-500 hover:underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <label className="text-sm flex items-center gap-1.5 cursor-pointer hover:underline" style={{ color: '#0057E7' }}>
                <FileText className="w-3.5 h-3.5" />
                Upload Resume
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        updateSimpleLayout({ resumeUrl: ev.target?.result as string });
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            )}
          </div>
        )}
        {!isEditMode && config.resumeUrl && (
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: '#696969' }}>Resume</h3>
            <a
              href={config.resumeUrl}
              download
              className="text-sm flex items-center gap-1.5 hover:underline"
              style={{ color: '#0057E7' }}
            >
              <Download className="w-3.5 h-3.5" />
              Download Resume
            </a>
          </div>
        )}

        {/* About Me */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#696969' }}>About Me</h3>
            {isEditMode && (
              <button
                onClick={() => setSidebarEditingSection(sidebarEditingSection === 'about' ? null : 'about')}
                className="text-xs flex items-center gap-1 hover:underline"
                style={{ color: '#0057E7' }}
              >
                <Plus className="w-3 h-3" />
                Edit
              </button>
            )}
          </div>
          {sidebarEditingSection === 'about' ? (
            <div className="space-y-2">
              <textarea
                placeholder="Tell visitors about yourself..."
                value={config.sidebarAbout || aboutSection?.content || ''}
                onChange={(e) => updateSimpleLayout({ sidebarAbout: e.target.value })}
                rows={4}
                className="w-full px-2 py-1.5 text-sm border rounded resize-none"
                style={{ borderColor: '#e0e0e0' }}
              />
              <button
                onClick={() => setSidebarEditingSection(null)}
                className="w-full py-1.5 text-xs font-medium text-white rounded"
                style={{ backgroundColor: '#0057E7' }}
              >
                Done
              </button>
            </div>
          ) : (
            (config.sidebarAbout || aboutSection?.content) && (
              <>
                <p className="leading-relaxed" style={{ color: '#050505', fontSize: '13px' }}>
                  {aboutSection?.content || config.sidebarAbout}
                </p>

                {(aboutSection?.secondParagraph || aboutSection?.quickFacts) && (
                  <button 
                    className="text-sm font-medium mt-2 flex items-center gap-1 hover:underline"
                    style={{ color: '#0057E7' }}
                  >
                    Read More
                    <ArrowLeft className="w-3 h-3 rotate-180" />
                  </button>
                )}
              </>
            )
          )}
        </div>


        {/* Contact Information */}
        {(contactSection?.email || contactSection?.phone || contactSection?.location) && (
          <div className="pt-2">
            <h3 className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: '#696969' }}>Contact</h3>
            <div className="space-y-2.5 text-sm">
              {contactSection?.email && (
                <a href={`mailto:${contactSection.email}`} className="flex items-center gap-2 hover:underline" style={{ color: '#050505' }}>
                  <Mail className="w-4 h-4" style={{ color: '#696969' }} />
                  {contactSection.email}
                </a>
              )}
              {contactSection?.phone && (
                <a href={`tel:${contactSection.phone}`} className="flex items-center gap-2 hover:underline" style={{ color: '#050505' }}>
                  <Phone className="w-4 h-4" style={{ color: '#696969' }} />
                  {contactSection.phone}
                </a>
              )}
              {contactSection?.location && (
                <div className="flex items-center gap-2" style={{ color: '#050505' }}>
                  <MapPin className="w-4 h-4" style={{ color: '#696969' }} />
                  {contactSection.location}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Member Since */}
        <div className="pt-4 border-t" style={{ borderColor: '#e0e0e0' }}>
          <p className="text-xs" style={{ color: '#696969' }}>
            Member since {new Date(portfolio.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
          </p>
        </div>

        {/* Report Link */}
        <button 
          className="text-xs mt-2 hover:underline"
          style={{ color: '#696969' }}
        >
          Report Profile
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-white" style={{ fontFamily: theme.typography.bodyFont }}>
      {/* Left Sidebar */}
      {config.showSidebar && config.sidebarPosition === 'left' && sidebarContent}

      {/* Main Content - Project Grid */}
      <div className="flex-1 overflow-y-auto h-screen">
        {/* Project Grid */}
        <div className="p-6">



            <div className="max-w-[1440px] mx-auto">
              {projects.length === 0 ? (
                <div className="text-center py-16">
                  <div className="text-lg font-medium mb-2" style={{ color: theme.colors.text }}>
                    No projects yet
                  </div>
                  <p className="text-sm mb-4" style={{ color: theme.colors.textSecondary }}>
                    Add your first project to showcase your work
                  </p>
                  <button
                    onClick={handleAddProject}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: theme.colors.primary }}
                  >
                    <Plus className="w-5 h-5" />
                    Add Your First Project
                  </button>
                </div>
              ) : (
                <div>
                  {/* Add Project Button (shown when projects exist) */}
                  <div className="flex justify-end mb-4">
                      <button
                        onClick={handleAddProject}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white text-sm transition-opacity hover:opacity-90"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <Plus className="w-4 h-4" />
                        Add Project
                      </button>
                    </div>
                  <div className="grid grid-cols-3 gap-6">
                    {projects.map((project) => (
                      <div
                        key={project.id}
                        className="group cursor-pointer"
                        onClick={() => handleProjectClick(project)}
                      >
                        {/* Project Image */}
                        <div className="relative overflow-hidden rounded-sm mb-3" style={{ width: '100%', aspectRatio: '4/3', minHeight: '280px' }}>
                          {project.imageUrl ? (
                            <img
                              src={project.imageUrl}
                              alt={project.title}
                              className="w-full h-full object-cover"
                              style={{ display: 'block' }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100">
                              <span className="text-gray-400 text-sm">No image</span>
                            </div>
                          )}

                          {/* Delete Button (shown on hover in edit mode) */}
                          {isEditMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (window.confirm(`Delete project "${project.title}"?`)) {
                                  handleDeleteProject(project.id);
                                }
                              }}
                              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                              title="Delete project"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 pointer-events-none">
                            <h3 className="font-semibold text-white text-sm mb-1">{project.title}</h3>
                            {project.description && (
                              <p className="text-xs text-gray-200 line-clamp-2">{project.description}</p>
                            )}
                          </div>
                        </div>

                        {/* Project Info (visible without hover) */}
                        <div className="text-center">
                          <h3 className="font-bold truncate" style={{ fontFamily: 'Arial, sans-serif', fontSize: '18px', color: '#696969', textAlign: 'center' }}>

                            {project.title}
                          </h3>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>


        {/* Other sections below projects - render actual section content with inline editing */}

        <div>

          {sections
            .filter(s => s.type !== 'projects' && s.type !== 'hero' && s.type !== 'about' && s.type !== 'contact' && s.type !== 'skills' && s.visible !== false)
            .map((section) => {

              const isInlineEditing = inlineEditingSectionId === section.id;
              return (
                <div key={section.id} id={`section-${section.id}`} className="relative group/section">
                  {/* Edit overlay button (shown on hover in edit mode) */}
                  {isEditMode && !isInlineEditing && (
                    <div className="absolute top-4 right-4 z-20 opacity-0 group-hover/section:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          selectSection(section.id);
                          setInlineEditingSectionId(section.id);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium text-white text-sm shadow-lg"
                        style={{ backgroundColor: theme.colors.primary }}
                      >
                        <Plus className="w-4 h-4" />
                        Edit Section
                      </button>
                    </div>
                  )}

                  {isInlineEditing ? (
                    /* Inline editor mode */
                    <div className="bg-gray-50">
                      {/* Editor header bar */}
                      <div className="sticky top-0 z-30 bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
                        <h3 className="text-sm font-semibold text-gray-700">
                          Editing: {section.type.charAt(0).toUpperCase() + section.type.slice(1)}
                        </h3>
                        <button
                          onClick={() => {
                            setInlineEditingSectionId(null);
                            selectSection(null);
                          }}
                          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full font-medium text-white text-sm"
                          style={{ backgroundColor: theme.colors.primary }}
                        >
                          <CheckCircle className="w-4 h-4" />
                          Done
                        </button>
                      </div>
                      {/* The actual section editor */}
                      <div className="max-w-4xl mx-auto">
                        <SectionEditor />
                      </div>
                    </div>
                  ) : (
                    /* Normal rendered section */
                    <SectionRenderer section={section} theme={theme} />
                  )}
                </div>
              );
            })}
        </div>


      </div>

      {/* Right Sidebar (if position is right) */}
      {config.showSidebar && config.sidebarPosition === 'right' && sidebarContent}
    </div>
  );
}







'use client';

import React from 'react';
import { ProjectsSection, Project, ProjectCategory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X, Plus, Trash2 } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { OptimizedImage } from './OptimizedImage';

import { ProjectEditorModal } from './ProjectEditorModal';

interface CategoryEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (category: ProjectCategory, projects: Project[]) => void;
  existingCategories: ProjectCategory[];
  editCategory?: ProjectCategory | null;
  existingProjects?: Project[];
}

export function CategoryEditorModal({ isOpen, onClose, onSave, existingCategories, editCategory, existingProjects = [] }: CategoryEditorModalProps) {
  const [categoryName, setCategoryName] = React.useState('');
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [expandedProject, setExpandedProject] = React.useState<string | null>(null);
  const [error, setError] = React.useState('');
  const [editingProject, setEditingProject] = React.useState<Project | null>(null);
  const [isProjectModalOpen, setIsProjectModalOpen] = React.useState(false);

  const isEditMode = !!editCategory;

  React.useEffect(() => {
    if (isOpen) {
      if (editCategory) {
        // Edit mode: populate with existing data
        setCategoryName(editCategory.name);
        setProjects(existingProjects.filter(p => p.category === editCategory.name));
      } else {
        // Add mode: clear form
        setCategoryName('');
        setProjects([]);
      }
      setExpandedProject(null);
      setError('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, editCategory?.id]);

  if (!isOpen) return null;

  const addProject = () => {
    const newProject: Project = {
      id: generateId(),
      title: 'New Project',
      description: '',
      imageUrl: '',
      tags: [],
      category: categoryName,
    };
    setProjects([...projects, newProject]);
    // Open the project editor modal for the new project
    setEditingProject(newProject);
    setIsProjectModalOpen(true);
  };

  const openProjectEditor = (project: Project) => {
    setEditingProject(project);
    setIsProjectModalOpen(true);
  };

  const handleSaveProject = (updatedProject: Project) => {
    setProjects(projects.map(p => 
      p.id === updatedProject.id ? updatedProject : p
    ));
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const removeProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    if (expandedProject === id) setExpandedProject(null);
  };

  const addProjectImage = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      const newImage = {
        id: generateId(),
        url: '',
        caption: '',
      };
      updateProject(projectId, {
        images: [...(project.images || []), newImage]
      });
    }
  };

  const updateProjectImage = (projectId: string, imageId: string, updates: { url?: string; caption?: string }) => {
    const project = projects.find(p => p.id === projectId);
    if (project && project.images) {
      updateProject(projectId, {
        images: project.images.map(img =>
          img.id === imageId ? { ...img, ...updates } : img
        )
      });
    }
  };

  const removeProjectImage = (projectId: string, imageId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (project && project.images) {
      updateProject(projectId, {
        images: project.images.filter(img => img.id !== imageId)
      });
    }
  };

  const handleSave = () => {
    if (!categoryName.trim()) {
      setError('Please enter a category name');
      return;
    }

    // Check for duplicate category name (only in add mode)
    if (!isEditMode && existingCategories.some(c => c.name.toLowerCase() === categoryName.trim().toLowerCase())) {
      setError('A category with this name already exists');
      return;
    }

    const newCategory: ProjectCategory = {
      id: generateId(),
      name: categoryName.trim(),
    };

    // Update all projects with the category name
    const updatedProjects = projects.map(p => ({
      ...p,
      category: categoryName.trim()
    }));

    onSave(newCategory, updatedProjects);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div 
        className="w-full max-w-7xl max-h-[95vh] overflow-y-auto bg-white rounded-3xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-semibold">{isEditMode ? 'Edit Category' : 'Add New Category'}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Category Name */}
          <div>
            <Label htmlFor="categoryName">Category Name *</Label>
            <Input
              id="categoryName"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                setError('');
              }}
              placeholder="e.g., Graphic Design, Logo Design, Web Design"
              className="mt-1"
            />
            {error && (
              <p className="text-red-500 text-sm mt-1">{error}</p>
            )}
          </div>

          {/* Projects Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Projects</Label>
                <p className="text-sm text-gray-500">Add projects to this category</p>
              </div>
              <Button onClick={addProject} size="sm" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Project
              </Button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
                <p>No projects yet. Click "Add Project" to add projects to this category.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <Card key={project.id}>
                    <CardContent className="p-4">
                      <div
                        className="flex items-center justify-between cursor-pointer"
                        onClick={() => openProjectEditor(project)}
                      >
                        <div className="flex items-center gap-3">
                          {project.imageUrl ? (
                            <OptimizedImage src={project.imageUrl} alt="" className="w-12 h-12 object-cover rounded" width={48} height={48} />

                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <span className="text-xs text-gray-400">No img</span>
                            </div>
                          )}
                          <span className="font-medium">{project.title || 'Untitled Project'}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeProject(project.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </div>
                      </div>

                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {isEditMode ? 'Save Changes' : 'Save Category'}
          </Button>
        </div>
      </div>

      {/* Project Editor Modal - rendered outside the modal container so it's not constrained */}
      <ProjectEditorModal
        project={editingProject}
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setEditingProject(null);
        }}
        onSave={handleSaveProject}
        categoryName={categoryName}
      />
    </div>
  );
}

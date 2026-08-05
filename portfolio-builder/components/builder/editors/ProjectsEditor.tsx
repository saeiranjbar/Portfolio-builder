'use client';

import React from 'react';
import { ProjectsSection, Project, ProjectCategory } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Type, FolderOpen } from 'lucide-react';
import { CategoryEditorModal } from '../CategoryEditorModal';
import { TextStyleControls } from '../TextStyleControls';
import { CollapsibleSection } from '../CollapsibleSection';


interface ProjectsEditorProps {
  section: ProjectsSection;
  onUpdate: (updates: Partial<ProjectsSection>) => void;
}

export function ProjectsEditor({ section, onUpdate }: ProjectsEditorProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = React.useState(false);
  const [editingCategoryData, setEditingCategoryData] = React.useState<ProjectCategory | null>(null);

  // Category management
  const openCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = (category: ProjectCategory, projects: Project[]) => {
    if (editingCategoryData) {
      // Edit mode: update existing category and replace its projects
      const otherProjects = section.projects.filter(p => p.category !== editingCategoryData.name);
      const updatedCategories = (section.categories || []).map(c => 
        c.id === editingCategoryData.id ? { ...c, name: category.name } : c
      );
      onUpdate({ 
        categories: updatedCategories,
        projects: [...otherProjects, ...projects]
      });
    } else {
      // Add mode: add new category
      onUpdate({ 
        categories: [...(section.categories || []), category],
        projects: [...section.projects, ...projects]
      });
    }
    setEditingCategoryData(null);
  };

  const openCategoryForEdit = (category: ProjectCategory) => {
    setEditingCategoryData(category);
    setIsCategoryModalOpen(true);
  };

  const openAddCategoryModal = () => {
    setEditingCategoryData(null);
    setIsCategoryModalOpen(true);
  };


  const removeCategory = (id: string) => {
    const category = section.categories?.find(c => c.id === id);
    if (category) {
      // Remove category and all its projects
      onUpdate({ 
        categories: (section.categories || []).filter(c => c.id !== id),
        projects: section.projects.filter(p => p.category !== category.name)
      });
    }
  };

  const hasCategories = section.categories && section.categories.length > 0;

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      {/* Categories Section */}
      <div className="h-full flex flex-col border-r border-gray-200 bg-gray-50/50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-2">
            <Label htmlFor="title" className="text-xs text-gray-500 uppercase tracking-wide">Section Title</Label>
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={section.showTitle !== false}
                onChange={(e) => onUpdate({ showTitle: e.target.checked })}
                className="rounded border-gray-300"
              />
              Show
            </label>
          </div>
          <Input
            id="title"
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Projects"
            className="mt-1"
          />
          <div className="mt-2">
            <TextStyleControls
              textStyles={section.textStyles}
              fieldKey="title"
              fieldLabel="Section Title"
              onUpdate={(textStyles) => onUpdate({ textStyles })}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 uppercase tracking-wide">Categories</span>
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
                <input
                  type="checkbox"
                  checked={section.showCategories !== false}
                  onChange={(e) => onUpdate({ showCategories: e.target.checked })}
                  className="rounded border-gray-300"
                />
                Show
              </label>
            </div>
            <Button onClick={openAddCategoryModal} size="sm" variant="ghost" className="h-6 px-2">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {!hasCategories ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">No categories yet</p>
              <Button onClick={openAddCategoryModal} size="sm" variant="outline" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </div>
          ) : (
            <nav className="space-y-1">
              {section.categories.map((category) => {
                const projectCount = section.projects.filter(p => p.category === category.name).length;

                return (
                  <div
                    key={category.id}
                    className="group flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors hover:bg-gray-100"
                    onClick={() => openCategoryForEdit(category)}
                  >
                    <span className="flex-1 text-sm text-gray-900">{category.name}</span>
                    <span className="text-xs text-gray-400 mr-1">{projectCount}</span>
                    <div className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeCategory(category.id);
                        }}
                        className="p-1 hover:bg-red-100 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </nav>
          )}
        </div>
      </div>

      {/* Category Editor Modal */}
      <CategoryEditorModal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setEditingCategoryData(null);
        }}
        onSave={handleSaveCategory}
        existingCategories={section.categories || []}
        editCategory={editingCategoryData}
        existingProjects={section.projects}
      />
    </div>
  );
}
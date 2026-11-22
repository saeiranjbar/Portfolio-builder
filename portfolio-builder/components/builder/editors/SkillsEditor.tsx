'use client';

import React, { useState } from 'react';
import { SkillsSection, Skill } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Type, Star, Check, X, 
  Figma, Atom, Leaf, Shield, Triangle, Server, Code, Code2, Palette, Wind, 
  GitBranch, Github, Gitlab, Box, Cloud, Flame, Database, Globe, 
  ShoppingBag, PenTool, Pencil, FileText, MessageSquare, KanbanSquare, List, 
  Layout, Zap, Mail, BarChart } from 'lucide-react';
import { cn, generateId } from '@/lib/utils';
import { CollapsibleSection } from '../CollapsibleSection';

// Common tool/software icon options with their components
const commonToolIcons: { id: string; name: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'figma', name: 'Figma', icon: Figma },
  { id: 'react', name: 'React', icon: Atom },
  { id: 'vue', name: 'Vue', icon: Leaf },
  { id: 'angular', name: 'Angular', icon: Shield },
  { id: 'nextjs', name: 'Next.js', icon: Triangle },
  { id: 'nodejs', name: 'Node.js', icon: Server },
  { id: 'python', name: 'Python', icon: Code },
  { id: 'javascript', name: 'JavaScript', icon: Code },
  { id: 'typescript', name: 'TypeScript', icon: Code2 },
  { id: 'html5', name: 'HTML5', icon: Code },
  { id: 'css3', name: 'CSS3', icon: Palette },
  { id: 'sass', name: 'Sass', icon: Palette },
  { id: 'tailwind', name: 'Tailwind', icon: Wind },
  { id: 'git', name: 'Git', icon: GitBranch },
  { id: 'github', name: 'GitHub', icon: Github },
  { id: 'gitlab', name: 'GitLab', icon: Gitlab },
  { id: 'docker', name: 'Docker', icon: Box },
  { id: 'aws', name: 'AWS', icon: Cloud },
  { id: 'firebase', name: 'Firebase', icon: Flame },
  { id: 'mongodb', name: 'MongoDB', icon: Database },
  { id: 'mysql', name: 'MySQL', icon: Database },
  { id: 'postgresql', name: 'PostgreSQL', icon: Database },
  { id: 'wordpress', name: 'WordPress', icon: Globe },
  { id: 'shopify', name: 'Shopify', icon: ShoppingBag },
  { id: 'photoshop', name: 'Photoshop', icon: PenTool },
  { id: 'illustrator', name: 'Illustrator', icon: PenTool },
  { id: 'sketch', name: 'Sketch', icon: Pencil },
  { id: 'canva', name: 'Canva', icon: PenTool },
  { id: 'notion', name: 'Notion', icon: FileText },
  { id: 'slack', name: 'Slack', icon: MessageSquare },
  { id: 'jira', name: 'Jira', icon: KanbanSquare },
  { id: 'trello', name: 'Trello', icon: List },
  { id: 'figjam', name: 'FigJam', icon: Pencil },
  { id: 'miro', name: 'Miro', icon: Layout },
  { id: 'zapier', name: 'Zapier', icon: Zap },
  { id: 'mailchimp', name: 'Mailchimp', icon: Mail },
  { id: 'google-analytics', name: 'Google Analytics', icon: BarChart },
];

// Map icon IDs to lucide-react icon components
const iconComponentMap: Record<string, React.ComponentType<{ className?: string }>> = {};
commonToolIcons.forEach(tool => {
  iconComponentMap[tool.id] = tool.icon;
});

interface SkillCardProps {
  skill: Skill;
  onUpdate: (id: string, updates: Partial<Skill>) => void;
  onRemove: (id: string) => void;
  categories: string[];
  /** True for the skill that was just added; it stays highlighted until its name field is left. */
  isNew?: boolean;
  onFocusDone?: () => void;
}

function SkillCard({ skill, onUpdate, onRemove, categories, isNew, onFocusDone }: SkillCardProps) {
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [addingCategory, setAddingCategory] = useState(false);
  const IconComponent = iconComponentMap[skill.icon ?? ''] ?? Star;

  return (
    <Card
      key={skill.id}
      className={cn(
        'min-w-0 transition-colors',
        isNew && 'border-2 border-blue-500 bg-blue-50 shadow-md ring-4 ring-blue-200'
      )}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-center justify-between gap-3">
          {/* Icon picker button */}
          <div className="relative shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowIconPicker(!showIconPicker)}
              className="w-12 h-12 p-0"
              title="Select icon"
            >
              <IconComponent className="w-5 h-5" />
            </Button>
            
            {/* Icon picker dropdown */}
            {showIconPicker && (
              <>
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowIconPicker(false)}
                />
                <div className="absolute top-full left-0 mt-1 z-50 bg-white border rounded-lg shadow-lg p-3 max-h-80 overflow-y-auto w-56">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-500">Select Icon</span>
                    <button onClick={() => setShowIconPicker(false)} className="text-gray-400 hover:text-gray-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {commonToolIcons.map((tool) => {
                      const Icon = tool.icon;
                      const isSelected = skill.icon === tool.id;
                      return (
                        <button
                          key={tool.id}
                          onClick={() => {
                            onUpdate(skill.id, { icon: tool.id });
                            setShowIconPicker(false);
                          }}
                          className={`p-1.5 rounded hover:bg-gray-100 flex items-center justify-center relative ${isSelected ? 'bg-blue-50 ring-2 ring-blue-500' : ''}`}
                          title={tool.name}
                        >
                          <Icon className="w-4 h-4" />
                          {isSelected && <Check className="w-2.5 h-2.5 text-blue-500 absolute -bottom-0.5 -right-0.5 bg-white rounded-full" />}
                        </button>
                      );
                    })}
                  </div>
                  {skill.icon && (
                    <button
                      onClick={() => {
                        onUpdate(skill.id, { icon: undefined });
                        setShowIconPicker(false);
                      }}
                      className="w-full mt-2 text-xs text-red-500 hover:text-red-700 py-1 border-t"
                    >
                      Remove icon
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0"
            aria-label={`Remove ${skill.name || 'skill'}`}
            onClick={() => onRemove(skill.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
          <div className="grid min-w-0 grid-cols-1 gap-3">
            <div className="min-w-0 space-y-1">
              <Label htmlFor={`skill-name-${skill.id}`} className="text-xs">Name</Label>
              <Input
                id={`skill-name-${skill.id}`}
                className="min-w-0"
                autoFocus={isNew}
                value={skill.name}
                onChange={(e) => onUpdate(skill.id, { name: e.target.value })}
                onBlur={() => onFocusDone?.()}
                placeholder="Skill name"
              />
            </div>
            <div className="min-w-0 space-y-1">
              <Label htmlFor={`skill-category-${skill.id}`} className="text-xs">Category</Label>
              {/* Lists every category already on this page; "New category" opens a text box */}
              <select
                id={`skill-category-${skill.id}`}
                className="flex h-10 w-full min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500/20"
                value={addingCategory ? '__new__' : skill.category}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setAddingCategory(true);
                  } else {
                    setAddingCategory(false);
                    onUpdate(skill.id, { category: e.target.value });
                  }
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__new__">+ New category…</option>
              </select>
              {addingCategory && (
                <Input
                  className="min-w-0"
                  autoFocus
                  value={skill.category}
                  onChange={(e) => onUpdate(skill.id, { category: e.target.value })}
                  onBlur={() => setAddingCategory(false)}
                  placeholder="Category name"
                />
              )}
            </div>
            <div className="min-w-0 space-y-1">
              <Label htmlFor={`skill-level-${skill.id}`} className="text-xs">Level: {skill.level}%</Label>
              <Input
                id={`skill-level-${skill.id}`}
                type="range"
                min="0"
                max="100"
                value={skill.level}
                onChange={(e) => onUpdate(skill.id, { level: parseInt(e.target.value) })}
                className="w-full border-0 px-0 shadow-none accent-blue-600"
              />
            </div>
          </div>
      </CardContent>
    </Card>
  );
}

interface SkillsEditorProps {
  section: SkillsSection;
  onUpdate: (updates: Partial<SkillsSection>) => void;
}

export function SkillsEditor({ section, onUpdate }: SkillsEditorProps) {
  // The skill just added, highlighted until the user leaves its name field
  const [newSkillId, setNewSkillId] = useState<string | null>(null);
  const addSkill = () => {
    // Reuse the category of the last skill so the new one lands in an existing group
    const lastCategory = section.skills[section.skills.length - 1]?.category;
    const newSkill: Skill = {
      id: generateId(),
      name: 'New Skill',
      level: 80,
      category: lastCategory || 'General',
    };
    setNewSkillId(newSkill.id);
    onUpdate({ skills: [newSkill, ...section.skills] });
  };

  const updateSkill = (id: string, updates: Partial<Skill>) => {
    onUpdate({
      skills: section.skills.map((s) =>
        s.id === id ? { ...s, ...updates } : s
      ),
    });
  };

  const removeSkill = (id: string) => {
    onUpdate({ skills: section.skills.filter((s) => s.id !== id) });
  };

  const categories = [...new Set(section.skills.map((s) => s.category))];

  return (
    <div className="space-y-4">

      {/* Section Title */}
      <CollapsibleSection title="Section Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Skills & Expertise"
        />
      </CollapsibleSection>

      {/* Skills */}
      <CollapsibleSection title="Skills" icon={Star} defaultOpen>
        <div className="flex items-center justify-between mb-3">
          <Label>Skills</Label>
          <Button onClick={addSkill} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </div>

        {section.skills.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            <p>No skills yet. Click &quot;Add Skill&quot; to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {section.skills.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                onUpdate={updateSkill}
                onRemove={removeSkill}
                categories={categories}
                isNew={skill.id === newSkillId}
                onFocusDone={() => setNewSkillId(null)}
              />
            ))}
          </div>
        )}
      </CollapsibleSection>


    </div>
  );
}

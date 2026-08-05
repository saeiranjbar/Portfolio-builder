'use client';

import React from 'react';
import { ExperienceSection, Experience } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Type, Briefcase } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { TextStyleControls } from '../TextStyleControls';
import { CollapsibleSection } from '../CollapsibleSection';
import { MonthPicker } from '@/components/ui/month-picker';


interface ExperienceEditorProps {
  section: ExperienceSection;
  onUpdate: (updates: Partial<ExperienceSection>) => void;
}

export function ExperienceEditor({ section, onUpdate }: ExperienceEditorProps) {
  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
      location: '',
    };
    onUpdate({ experiences: [...section.experiences, newExp] });
  };

  const updateExperience = (id: string, updates: Partial<Experience>) => {
    onUpdate({
      experiences: section.experiences.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    });
  };

  const removeExperience = (id: string) => {
    onUpdate({ experiences: section.experiences.filter((e) => e.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Experience Section</h2>
        <p className="text-sm text-gray-500">
          Your work history and professional experience.
        </p>
      </div>

      {/* Section Title */}
      <CollapsibleSection title="Section Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input
          value={section.title}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
        <TextStyleControls
          textStyles={section.textStyles}
          fieldKey="title"
          fieldLabel="Section Title"
          onUpdate={(textStyles) => onUpdate({ textStyles })}
        />
      </CollapsibleSection>

      {/* Experiences */}
      <CollapsibleSection title="Experiences" icon={Briefcase} defaultOpen>
        <div className="flex items-center justify-between">
          <Label>Experiences</Label>
          <Button onClick={addExperience} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Experience
          </Button>
        </div>

        {section.experiences.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            <p>No experiences yet. Click "Add Experience" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {section.experiences.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{exp.company || 'New Experience'}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExperience(exp.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Company Name</Label>
                        <Input
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(exp.id, { company: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Position</Label>
                        <Input
                          value={exp.position}
                          onChange={(e) =>
                            updateExperience(exp.id, { position: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Start Date</Label>
                      <MonthPicker
                        value={exp.startDate}
                        onChange={(val) =>
                          updateExperience(exp.id, { startDate: val })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Date</Label>
                      <MonthPicker
                        value={exp.endDate}
                        onChange={(val) =>
                          updateExperience(exp.id, { endDate: val })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Location</Label>
                      <Input
                        value={exp.location}
                        onChange={(e) =>
                          updateExperience(exp.id, { location: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={exp.description}
                        onChange={(e) =>
                          updateExperience(exp.id, { description: e.target.value })
                        }
                        rows={3}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CollapsibleSection>
    </div>
  );
}

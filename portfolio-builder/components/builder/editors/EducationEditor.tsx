'use client';

import React from 'react';
import { EducationSection, Education } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, Type, GraduationCap } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { TextStyleControls } from '../TextStyleControls';
import { CollapsibleSection } from '../CollapsibleSection';
import { MonthPicker } from '@/components/ui/month-picker';


interface EducationEditorProps {
  section: EducationSection;
  onUpdate: (updates: Partial<EducationSection>) => void;
}

export function EducationEditor({ section, onUpdate }: EducationEditorProps) {
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      description: '',
    };
    onUpdate({ educations: [...section.educations, newEdu] });
  };

  const updateEducation = (id: string, updates: Partial<Education>) => {
    onUpdate({
      educations: section.educations.map((e) =>
        e.id === id ? { ...e, ...updates } : e
      ),
    });
  };

  const removeEducation = (id: string) => {
    onUpdate({ educations: section.educations.filter((e) => e.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2">Education Section</h2>
        <p className="text-sm text-gray-500">
          Your educational background and certifications.
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

      {/* Education Entries */}
      <CollapsibleSection title="Education" icon={GraduationCap} defaultOpen>
        <div className="flex items-center justify-between">
          <Label>Education</Label>
          <Button onClick={addEducation} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </div>

        {section.educations.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            <p>No education entries yet. Click "Add Education" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {section.educations.map((edu) => (
              <Card key={edu.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{edu.institution || 'New Education'}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeEducation(edu.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Institution</Label>
                        <Input
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(edu.id, { institution: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Degree</Label>
                        <Input
                          value={edu.degree}
                          onChange={(e) =>
                            updateEducation(edu.id, { degree: e.target.value })
                          }
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Field of Study</Label>
                      <Input
                        value={edu.field}
                        onChange={(e) =>
                          updateEducation(edu.id, { field: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Start Date</Label>
                      <MonthPicker
                        value={edu.startDate}
                        onChange={(val) =>
                          updateEducation(edu.id, { startDate: val })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">End Date</Label>
                      <MonthPicker
                        value={edu.endDate}
                        onChange={(val) =>
                          updateEducation(edu.id, { endDate: val })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Description</Label>
                      <Textarea
                        value={edu.description}
                        onChange={(e) =>
                          updateEducation(edu.id, { description: e.target.value })
                        }
                        rows={2}
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

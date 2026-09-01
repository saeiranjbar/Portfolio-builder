'use client';

import React from 'react';
import { TestimonialsSection, Testimonial } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ImageUploader } from '../ImageUploader';
import { Plus, Trash2, Type, MessageSquare } from 'lucide-react';
import { generateId } from '@/lib/utils';
import { SectionTextStyleEditor } from '../SectionTextStyleEditor';
import { CollapsibleSection } from '../CollapsibleSection';


interface TestimonialsEditorProps {
  section: TestimonialsSection;
  onUpdate: (updates: Partial<TestimonialsSection>) => void;
}

export function TestimonialsEditor({ section, onUpdate }: TestimonialsEditorProps) {
  const addTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: generateId(),
      name: 'Client Name',
      role: 'Position',
      company: 'Company',
      content: 'Testimonial content...',
      avatar: '',
    };
    onUpdate({ testimonials: [...section.testimonials, newTestimonial] });
  };

  const updateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    onUpdate({
      testimonials: section.testimonials.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    });
  };

  const removeTestimonial = (id: string) => {
    onUpdate({ testimonials: section.testimonials.filter((t) => t.id !== id) });
  };

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
          placeholder="What People Say"
        />
      </CollapsibleSection>

      {/* Testimonials */}
      <CollapsibleSection title="Testimonials" icon={MessageSquare} defaultOpen>
        <div className="flex items-center justify-between">
          <Label>Testimonials</Label>
          <Button onClick={addTestimonial} size="sm" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Add Testimonial
          </Button>
        </div>

        {section.testimonials.length === 0 ? (
          <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-lg">
            <p>No testimonials yet. Click "Add Testimonial" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {section.testimonials.map((testimonial) => (
              <Card key={testimonial.id}>
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{testimonial.name || 'New Testimonial'}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeTestimonial(testimonial.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={testimonial.name}
                          onChange={(e) =>
                            updateTestimonial(testimonial.id, { name: e.target.value })
                          }
                          placeholder="Client name"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Role</Label>
                        <Input
                          value={testimonial.role}
                          onChange={(e) =>
                            updateTestimonial(testimonial.id, { role: e.target.value })
                          }
                          placeholder="Position"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Company</Label>
                        <Input
                          value={testimonial.company}
                          onChange={(e) =>
                            updateTestimonial(testimonial.id, { company: e.target.value })
                          }
                          placeholder="Company"
                        />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs">Testimonial</Label>
                      <Textarea
                        value={testimonial.content}
                        onChange={(e) =>
                          updateTestimonial(testimonial.id, { content: e.target.value })
                        }
                        placeholder="What did they say about you?"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Avatar</Label>
                      <ImageUploader
                        value={testimonial.avatar}
                        onChange={(url) => updateTestimonial(testimonial.id, { avatar: url })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CollapsibleSection>

      {/* Unified Text Styles for all text elements */}
      <SectionTextStyleEditor
        textStyles={section.textStyles}
        fields={[{ key: 'title', label: 'Section Title' }]}
        onUpdate={(textStyles) => onUpdate({ textStyles })}
      />
    </div>
  );
}

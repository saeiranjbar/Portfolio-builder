'use client';

import React from 'react';
import { ProcessSection, ProcessStep } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Type, FileText, ListOrdered } from 'lucide-react';
import { generateId } from '@/lib/section-helpers';
import { CollapsibleSection } from '../CollapsibleSection';

interface ProcessEditorProps {
  section: ProcessSection;
  onUpdate: (updates: Partial<ProcessSection>) => void;
}

export function ProcessEditor({ section, onUpdate }: ProcessEditorProps) {
  const addStep = () => {
    const newStep: ProcessStep = { id: generateId(), number: section.steps.length + 1, title: '', description: '' };
    onUpdate({ steps: [...section.steps, newStep] });
  };
  const updateStep = (id: string, updates: Partial<ProcessStep>) => {
    onUpdate({ steps: section.steps.map((s) => (s.id === id ? { ...s, ...updates } : s)) });
  };
  const removeStep = (id: string) => {
    onUpdate({ steps: section.steps.filter((s) => s.id !== id) });
  };

  return (
    <div className="space-y-4">

      {/* Title */}
      <CollapsibleSection title="Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input value={section.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="How I Work" />
      </CollapsibleSection>

      {/* Subtitle */}
      <CollapsibleSection title="Subtitle" icon={FileText}
        showToggle
        toggleChecked={section.showSubtitle !== false}
        onToggleChange={(checked) => onUpdate({ showSubtitle: checked })}
      >
        <Input value={section.subtitle || ''} onChange={(e) => onUpdate({ subtitle: e.target.value })} placeholder="My design process" />
      </CollapsibleSection>

      {/* Layout */}
      <CollapsibleSection title="Layout" icon={ListOrdered}>
        <div className="flex gap-2 mt-2">
          {(['horizontal', 'vertical'] as const).map((l) => (
            <Button key={l} variant={section.layout === l ? 'default' : 'outline'} size="sm" onClick={() => onUpdate({ layout: l })}>
              {l.charAt(0).toUpperCase() + l.slice(1)}
            </Button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Steps */}
      <CollapsibleSection title="Steps" icon={ListOrdered} defaultOpen>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Steps ({section.steps.length})</Label>
          <Button size="sm" onClick={addStep}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        {section.steps.map((step) => (
          <div key={step.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Step {step.number}</span>
              <Button size="sm" variant="ghost" onClick={() => removeStep(step.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={step.title} onChange={(e) => updateStep(step.id, { title: e.target.value })} placeholder="Discover" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={step.description} onChange={(e) => updateStep(step.id, { description: e.target.value })} placeholder="Research and understand the problem" rows={2} />
            </div>
          </div>
        ))}
        {section.steps.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No steps yet. Click "Add" to create one.</p>}
      </CollapsibleSection>
    </div>
  );
}

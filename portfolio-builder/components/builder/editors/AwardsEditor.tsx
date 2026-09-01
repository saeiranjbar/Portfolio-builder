'use client';

import React from 'react';
import { AwardsSection, Award } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Type, Trophy } from 'lucide-react';
import { generateId } from '@/lib/section-helpers';
import { CollapsibleSection } from '../CollapsibleSection';

interface AwardsEditorProps {
  section: AwardsSection;
  onUpdate: (updates: Partial<AwardsSection>) => void;
}

export function AwardsEditor({ section, onUpdate }: AwardsEditorProps) {
  const addAward = () => {
    const newAward: Award = { id: generateId(), title: '', organization: '', year: '' };
    onUpdate({ awards: [...section.awards, newAward] });
  };
  const updateAward = (id: string, updates: Partial<Award>) => {
    onUpdate({ awards: section.awards.map((a) => (a.id === id ? { ...a, ...updates } : a)) });
  };
  const removeAward = (id: string) => {
    onUpdate({ awards: section.awards.filter((a) => a.id !== id) });
  };

  return (
    <div className="space-y-4">

      {/* Title */}
      <CollapsibleSection title="Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input value={section.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Awards & Recognition" />
      </CollapsibleSection>

      {/* Awards */}
      <CollapsibleSection title="Awards" icon={Trophy} defaultOpen>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Awards ({section.awards.length})</Label>
          <Button size="sm" onClick={addAward}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        {section.awards.map((award) => (
          <div key={award.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Award</span>
              <Button size="sm" variant="ghost" onClick={() => removeAward(award.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={award.title} onChange={(e) => updateAward(award.id, { title: e.target.value })} placeholder="Design Excellence Award" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Organization</Label>
                <Input value={award.organization} onChange={(e) => updateAward(award.id, { organization: e.target.value })} placeholder="AIGA" />
              </div>
              <div>
                <Label>Year</Label>
                <Input value={award.year} onChange={(e) => updateAward(award.id, { year: e.target.value })} placeholder="2024" />
              </div>
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={award.description || ''} onChange={(e) => updateAward(award.id, { description: e.target.value })} placeholder="Optional description" rows={2} />
            </div>
          </div>
        ))}
        {section.awards.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No awards yet. Click "Add" to create one.</p>}
      </CollapsibleSection>
    </div>
  );
}

'use client';

import React from 'react';
import { StatsSection, Stat } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Type, BarChart3 } from 'lucide-react';
import { generateId } from '@/lib/section-helpers';
import { CollapsibleSection } from '../CollapsibleSection';

interface StatsEditorProps {
  section: StatsSection;
  onUpdate: (updates: Partial<StatsSection>) => void;
}

export function StatsEditor({ section, onUpdate }: StatsEditorProps) {
  const addStat = () => {
    const newStat: Stat = { id: generateId(), value: 0, suffix: '+', label: '' };
    onUpdate({ stats: [...section.stats, newStat] });
  };
  const updateStat = (id: string, updates: Partial<Stat>) => {
    onUpdate({ stats: section.stats.map((s) => (s.id === id ? { ...s, ...updates } : s)) });
  };
  const removeStat = (id: string) => {
    onUpdate({ stats: section.stats.filter((s) => s.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Stats</h2>
        <p className="text-sm text-gray-700">Quick facts and numbers about your work.</p>
      </div>

      {/* Title */}
      <CollapsibleSection title="Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input value={section.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="By The Numbers" />
      </CollapsibleSection>

      {/* Stats */}
      <CollapsibleSection title="Stats" icon={BarChart3} defaultOpen>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Stats ({section.stats.length})</Label>
          <Button size="sm" onClick={addStat}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        {section.stats.map((stat) => (
          <div key={stat.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Stat</span>
              <Button size="sm" variant="ghost" onClick={() => removeStat(stat.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Value</Label>
                <Input type="number" value={stat.value} onChange={(e) => updateStat(stat.id, { value: parseInt(e.target.value) || 0 })} placeholder="50" />
              </div>
              <div>
                <Label>Suffix</Label>
                <Input value={stat.suffix} onChange={(e) => updateStat(stat.id, { suffix: e.target.value })} placeholder="+" />
              </div>
            </div>
            <div>
              <Label>Label</Label>
              <Input value={stat.label} onChange={(e) => updateStat(stat.id, { label: e.target.value })} placeholder="Projects Completed" />
            </div>
          </div>
        ))}
        {section.stats.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No stats yet. Click "Add" to create one.</p>}
      </CollapsibleSection>
    </div>
  );
}

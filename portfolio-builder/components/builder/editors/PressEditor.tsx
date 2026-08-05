'use client';

import React from 'react';
import { PressSection, PressItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Type, FileText, Newspaper } from 'lucide-react';
import { generateId } from '@/lib/section-helpers';
import { CollapsibleSection } from '../CollapsibleSection';

interface PressEditorProps {
  section: PressSection;
  onUpdate: (updates: Partial<PressSection>) => void;
}

export function PressEditor({ section, onUpdate }: PressEditorProps) {
  const addItem = () => {
    const newItem: PressItem = { id: generateId(), name: '', logo: '' };
    onUpdate({ items: [...section.items, newItem] });
  };
  const updateItem = (id: string, updates: Partial<PressItem>) => {
    onUpdate({ items: section.items.map((i) => (i.id === id ? { ...i, ...updates } : i)) });
  };
  const removeItem = (id: string) => {
    onUpdate({ items: section.items.filter((i) => i.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Press / Featured In</h2>
        <p className="text-sm text-gray-700">Showcase press logos and media mentions.</p>
      </div>

      {/* Title */}
      <CollapsibleSection title="Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input value={section.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Featured In" />
      </CollapsibleSection>

      {/* Subtitle */}
      <CollapsibleSection title="Subtitle" icon={FileText}
        showToggle
        toggleChecked={section.showSubtitle !== false}
        onToggleChange={(checked) => onUpdate({ showSubtitle: checked })}
      >
        <Input value={section.subtitle || ''} onChange={(e) => onUpdate({ subtitle: e.target.value })} placeholder="As seen on" />
      </CollapsibleSection>

      {/* Press Items */}
      <CollapsibleSection title="Press Items" icon={Newspaper} defaultOpen>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Press Items ({section.items.length})</Label>
          <Button size="sm" onClick={addItem}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        {section.items.map((item) => (
          <div key={item.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Press Item</span>
              <Button size="sm" variant="ghost" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={item.name} onChange={(e) => updateItem(item.id, { name: e.target.value })} placeholder="Forbes" />
            </div>
            <div>
              <Label>Logo URL</Label>
              <Input value={item.logo} onChange={(e) => updateItem(item.id, { logo: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label>Link (optional)</Label>
              <Input value={item.link || ''} onChange={(e) => updateItem(item.id, { link: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        ))}
        {section.items.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No press items yet. Click "Add" to create one.</p>}
      </CollapsibleSection>
    </div>
  );
}

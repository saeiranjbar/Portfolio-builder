'use client';

import React from 'react';
import { FAQSection, FAQItem } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CollapsibleSection } from '../CollapsibleSection';
import { Plus, Trash2, HelpCircle, Settings } from 'lucide-react';

interface FAQEditorProps {
  section: FAQSection;
  onUpdate: (updates: Partial<FAQSection>) => void;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

export function FAQEditor({ section, onUpdate }: FAQEditorProps) {
  const addItem = () => {
    const newItem: FAQItem = { id: generateId(), question: 'New Question', answer: '' };
    onUpdate({ items: [...section.items, newItem] });
  };

  const updateItem = (id: string, updates: Partial<FAQItem>) => {
    onUpdate({ items: section.items.map(i => i.id === id ? { ...i, ...updates } : i) });
  };

  const removeItem = (id: string) => {
    onUpdate({ items: section.items.filter(i => i.id !== id) });
  };

  return (
    <div className="space-y-4">

      <CollapsibleSection title="Section Title" icon={Settings} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <div>
          <Label>Section Title</Label>
          <Input
            value={section.title}
            onChange={(e) => onUpdate({ title: e.target.value })}
            placeholder="Frequently Asked Questions"
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Subtitle" icon={Settings}
        showToggle
        toggleChecked={section.showSubtitle !== false}
        onToggleChange={(checked) => onUpdate({ showSubtitle: checked })}
      >
        <div>
          <Label>Subtitle</Label>
          <Input
            value={section.subtitle || ''}
            onChange={(e) => onUpdate({ subtitle: e.target.value })}
            placeholder="Got questions? I've got answers."
          />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Layout & Settings" icon={Settings}>
        <div>
          <Label>Layout</Label>
          <select
            value={section.layout}
            onChange={(e) => onUpdate({ layout: e.target.value as any })}
            className="w-full px-3 py-2 border rounded-xl text-sm"
          >
            <option value="accordion">Accordion</option>
            <option value="grid">Grid</option>
          </select>
        </div>
      </CollapsibleSection>

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Questions ({section.items.length})</span>
        <Button variant="outline" size="sm" onClick={addItem}>
          <Plus className="w-3 h-3 mr-1" /> Add Question
        </Button>
      </div>

      {section.items.map((item) => (
        <CollapsibleSection key={item.id} title={item.question || 'Untitled Question'} icon={HelpCircle}>
          <div>
            <Label>Question</Label>
            <Input
              value={item.question}
              onChange={(e) => updateItem(item.id, { question: e.target.value })}
              placeholder="What services do you offer?"
            />
          </div>
          <div>
            <Label>Answer</Label>
            <Textarea
              value={item.answer}
              onChange={(e) => updateItem(item.id, { answer: e.target.value })}
              placeholder="I offer branding, web design, and..."
              rows={4}
            />
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-red-500"
            onClick={() => removeItem(item.id)}
          >
            <Trash2 className="w-3 h-3 mr-1" /> Remove Question
          </Button>
        </CollapsibleSection>
      ))}
    </div>
  );
}

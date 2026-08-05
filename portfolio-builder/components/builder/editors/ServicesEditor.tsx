'use client';

import React from 'react';
import { ServicesSection, Service } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Type, FileText, Briefcase } from 'lucide-react';
import { generateId } from '@/lib/section-helpers';
import { CollapsibleSection } from '../CollapsibleSection';

interface ServicesEditorProps {
  section: ServicesSection;
  onUpdate: (updates: Partial<ServicesSection>) => void;
}

export function ServicesEditor({ section, onUpdate }: ServicesEditorProps) {
  const addService = () => {
    const newService: Service = { id: generateId(), title: '', description: '', icon: 'Star' };
    onUpdate({ services: [...section.services, newService] });
  };
  const updateService = (id: string, updates: Partial<Service>) => {
    onUpdate({ services: section.services.map((s) => (s.id === id ? { ...s, ...updates } : s)) });
  };
  const removeService = (id: string) => {
    onUpdate({ services: section.services.filter((s) => s.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Services</h2>
        <p className="text-sm text-gray-700">List the services you offer.</p>
      </div>

      {/* Title */}
      <CollapsibleSection title="Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input value={section.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="What I Do" />
      </CollapsibleSection>

      {/* Subtitle */}
      <CollapsibleSection title="Subtitle" icon={FileText}
        showToggle
        toggleChecked={section.showSubtitle !== false}
        onToggleChange={(checked) => onUpdate({ showSubtitle: checked })}
      >
        <Input value={section.subtitle || ''} onChange={(e) => onUpdate({ subtitle: e.target.value })} placeholder="Services I offer" />
      </CollapsibleSection>

      {/* Services */}
      <CollapsibleSection title="Services" icon={Briefcase} defaultOpen>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Services ({section.services.length})</Label>
          <Button size="sm" onClick={addService}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        {section.services.map((service) => (
          <div key={service.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Service</span>
              <Button size="sm" variant="ghost" onClick={() => removeService(service.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={service.title} onChange={(e) => updateService(service.id, { title: e.target.value })} placeholder="Brand Design" />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={service.description} onChange={(e) => updateService(service.id, { description: e.target.value })} placeholder="Description of the service" rows={2} />
            </div>
            <div>
              <Label>Icon (lucide-react name)</Label>
              <Input value={service.icon} onChange={(e) => updateService(service.id, { icon: e.target.value })} placeholder="Star" />
            </div>
          </div>
        ))}
        {section.services.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No services yet. Click "Add" to create one.</p>}
      </CollapsibleSection>
    </div>
  );
}

'use client';

import React from 'react';
import { CertificationsSection, Certification } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Type, Award } from 'lucide-react';
import { generateId } from '@/lib/section-helpers';
import { CollapsibleSection } from '../CollapsibleSection';

interface CertificationsEditorProps {
  section: CertificationsSection;
  onUpdate: (updates: Partial<CertificationsSection>) => void;
}

export function CertificationsEditor({ section, onUpdate }: CertificationsEditorProps) {
  const addCert = () => {
    const newCert: Certification = { id: generateId(), name: '', issuer: '', date: '' };
    onUpdate({ certifications: [...section.certifications, newCert] });
  };
  const updateCert = (id: string, updates: Partial<Certification>) => {
    onUpdate({ certifications: section.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)) });
  };
  const removeCert = (id: string) => {
    onUpdate({ certifications: section.certifications.filter((c) => c.id !== id) });
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-2 text-gray-900">Certifications</h2>
        <p className="text-sm text-gray-700">Showcase professional certifications and courses.</p>
      </div>

      {/* Title */}
      <CollapsibleSection title="Title" icon={Type} defaultOpen
        showToggle
        toggleChecked={section.showTitle !== false}
        onToggleChange={(checked) => onUpdate({ showTitle: checked })}
      >
        <Input value={section.title} onChange={(e) => onUpdate({ title: e.target.value })} placeholder="Certifications" />
      </CollapsibleSection>

      {/* Certifications */}
      <CollapsibleSection title="Certifications" icon={Award} defaultOpen>
        <div className="flex items-center justify-between">
          <Label className="text-base font-semibold">Certifications ({section.certifications.length})</Label>
          <Button size="sm" onClick={addCert}><Plus className="w-4 h-4 mr-1" /> Add</Button>
        </div>
        {section.certifications.map((cert) => (
          <div key={cert.id} className="p-4 border rounded-lg space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Certification</span>
              <Button size="sm" variant="ghost" onClick={() => removeCert(cert.id)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
            </div>
            <div>
              <Label>Name</Label>
              <Input value={cert.name} onChange={(e) => updateCert(cert.id, { name: e.target.value })} placeholder="Google UX Design Certificate" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Issuer</Label>
                <Input value={cert.issuer} onChange={(e) => updateCert(cert.id, { issuer: e.target.value })} placeholder="Google / Coursera" />
              </div>
              <div>
                <Label>Date</Label>
                <Input value={cert.date} onChange={(e) => updateCert(cert.id, { date: e.target.value })} placeholder="Jan 2024" />
              </div>
            </div>
            <div>
              <Label>Credential URL (optional)</Label>
              <Input value={cert.url || ''} onChange={(e) => updateCert(cert.id, { url: e.target.value })} placeholder="https://..." />
            </div>
          </div>
        ))}
        {section.certifications.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No certifications yet. Click "Add" to create one.</p>}
      </CollapsibleSection>
    </div>
  );
}

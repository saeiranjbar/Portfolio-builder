'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Check, Sparkles } from 'lucide-react';
import { templates } from '@/lib/templates';
import { makeTemplatePortfolio } from '@/lib/template-portfolio';
import { cn } from '@/lib/utils';
import { usePortfolioStore, type EditorPage } from '@/lib/store';
import { SiteRenderer } from '@/components/site/SiteRenderer';
import type { Template } from '@/lib/types';
import { Confetti } from './effects/Confetti';

interface TemplateGalleryProps {
  onClose: () => void;
  onSelect: () => void;
}

function FullTemplatePreview({ template, onBack, onUse }: { template: Template; onBack: () => void; onUse: () => void }) {
  const [device, setDevice] = React.useState<'desktop' | 'mobile'>('desktop');
  const site = React.useMemo(() => {
    const portfolio = makeTemplatePortfolio(template);
    const pages: EditorPage[] = [{ id: 'home', slug: '', title: 'Home', themeMode: 'inherit', sections: portfolio.sections }];
    return { portfolio, pages };
  }, [template]);
  return <div className="fixed inset-0 z-[110] flex flex-col bg-gray-200" role="dialog" aria-modal="true" aria-label={`Preview ${template.name}`}>
    <div className="flex flex-wrap items-center gap-2 bg-slate-950 p-3 text-white">
      <button type="button" onClick={onBack} className="rounded-lg px-3 py-2 hover:bg-slate-800">← Back to templates</button>
      <strong className="mr-auto">{template.name}</strong>
      <button type="button" aria-pressed={device === 'desktop'} onClick={() => setDevice('desktop')} className="rounded-lg px-3 py-2 aria-pressed:bg-slate-700">Desktop</button>
      <button type="button" aria-pressed={device === 'mobile'} onClick={() => setDevice('mobile')} className="rounded-lg px-3 py-2 aria-pressed:bg-slate-700">Mobile</button>
      <button type="button" onClick={onUse} className="rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-700">Use this template</button>
    </div>
    <div className="min-h-0 flex-1 overflow-hidden p-2 sm:p-4"><SiteRenderer key={template.id} portfolio={site.portfolio} pages={site.pages} pageId="home" viewMode={device} /></div>
  </div>;
}

export function TemplateGallery({ onClose, onSelect }: TemplateGalleryProps) {
  const { setNewPortfolio, isDirty } = usePortfolioStore();
  const [selectedTemplate, setSelectedTemplate] = React.useState<string | null>(null);
  const [previewTemplate, setPreviewTemplate] = React.useState<Template | null>(null);
  const [showConfetti, setShowConfetti] = React.useState(false);

  const handleSelect = (template: Template) => {
    if (isDirty && !window.confirm('Start a new site from this template? Unsaved changes in the current site will be replaced. Save them first if you want to keep them.')) return;
    setSelectedTemplate(template.id);
    const newPortfolio = makeTemplatePortfolio(template);
    setPreviewTemplate(null);

    setTimeout(() => {
      setNewPortfolio(newPortfolio);
      setShowConfetti(true);
      setTimeout(() => {
        onSelect();
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#f5f5f7] overflow-hidden">
      <div className="relative z-10 w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Choose a Template</h1>
          </div>
          <span className="text-sm text-gray-400">{templates.length} templates available</span>
        </div>

        {/* Template Grid */}
        {/* overflow-x-hidden stops hovered tiles (scaled 1.02) from adding a horizontal scrollbar; the padding leaves them room inside the scroll area */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden -m-2 p-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
            {templates.map((template, i) => (
              <motion.button
                type="button"
                key={template.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: 'easeOut' }}
                className={cn(
                  'group relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer transition-all hover:shadow-2xl hover:scale-[1.02]',
                  selectedTemplate === template.id && 'ring-2 ring-indigo-500 ring-offset-2'
                )}
                onClick={() => selectedTemplate === null && setPreviewTemplate(template)}
                aria-label={`Preview ${template.name}`}
              >
                {/* Preview area */}
                <div
                  className="relative h-48 overflow-hidden"
                  style={{
                    background: template.theme.colors.background,
                  }}
                >
                  {/* Mini preview mockup */}
                  <div className="absolute inset-0 p-4 flex flex-col">
                    {/* Nav bar mockup */}
                    <div className="flex items-center justify-between mb-3">
                      <div
                        className="text-xs font-bold"
                        style={{
                          color: template.theme.colors.text,
                          fontFamily: template.theme.typography.headingFont,
                        }}
                      >
                        {template.name.slice(0, 12).toUpperCase()}
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3].map((n) => (
                          <div
                            key={n}
                            className="w-6 h-1 rounded-full"
                            style={{ background: template.theme.colors.textSecondary, opacity: 0.3 }}
                          />
                        ))}
                      </div>
                    </div>
                    {/* Hero mockup */}
                    <div className="flex-1 flex flex-col justify-center">
                      <div
                        className="text-lg font-bold mb-1"
                        style={{
                          color: template.theme.colors.text,
                          fontFamily: template.theme.typography.headingFont,
                        }}
                      >
                        {template.defaultSections[0]?.type === 'hero'
                          ? (template.defaultSections[0] as any).name || 'Your Name'
                          : 'Your Title'}
                      </div>
                      <div
                        className="text-xs mb-2"
                        style={{ color: template.theme.colors.textSecondary }}
                      >
                        {template.defaultSections[0]?.type === 'hero'
                          ? (template.defaultSections[0] as any).title || 'Your Title'
                          : 'Subtitle'}
                      </div>
                      <div className="flex gap-1">
                        <div
                          className="px-3 py-1 rounded-full text-[10px] font-medium"
                          style={{
                            background: template.theme.colors.primary,
                            color: template.theme.colors.background === '#ffffff' ? '#ffffff' : template.theme.colors.text,
                          }}
                        >
                          Button
                        </div>
                      </div>
                    </div>
                    {/* Image grid mockup */}
                    <div className="flex gap-1 mt-2">
                      {[1, 2, 3].map((n) => (
                        <div
                          key={n}
                          className="flex-1 h-8 rounded"
                          style={{
                            background: template.theme.colors.primary,
                            opacity: 0.15,
                            borderRadius: template.theme.borderRadius,
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Selected overlay */}
                  <AnimatePresence>
                    {selectedTemplate === template.id && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-indigo-500/20 flex items-center justify-center"
                      >
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center shadow-lg"
                        >
                          <Check className="w-6 h-6 text-white" />
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Info area */}
                <div className="p-4">
                  <h3 className="text-base font-bold text-gray-900 mb-1">{template.name}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  {/* Theme swatches */}
                  <div className="flex items-center gap-1.5">
                    <div
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ background: template.theme.colors.primary }}
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ background: template.theme.colors.secondary }}
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ background: template.theme.colors.accent }}
                    />
                    <div
                      className="w-5 h-5 rounded-full border border-gray-200"
                      style={{ background: template.theme.colors.background }}
                    />
                    <span className="text-xs text-gray-400 ml-1">
                      {template.theme.typography.headingFont}
                    </span>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Loading state */}
        <AnimatePresence>
          {selectedTemplate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-20"
            >
              <div className="flex flex-col items-center gap-4">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-10 h-10 text-indigo-600" />
                </motion.div>
                <p className="text-lg font-medium text-gray-700">Setting up your template...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />
      {previewTemplate && <FullTemplatePreview template={previewTemplate} onBack={() => setPreviewTemplate(null)} onUse={() => handleSelect(previewTemplate)} />}
    </div>
  );
}

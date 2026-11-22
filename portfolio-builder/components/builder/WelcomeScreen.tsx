'use client';

import React from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Wand2, LayoutGrid, Sparkles, LayoutTemplate } from 'lucide-react';
import { MagneticButton } from './effects/MagneticButton';
import { AtmosphereBackdrop } from './effects/AtmosphereBackdrop';
import { SpotlightCard } from './effects/SpotlightCard';
import { AccountControls } from '@/components/AccountControls';
import { SavedWebsites } from './SavedWebsites';

interface WelcomeScreenProps {
  onChooseAI: () => void;
  onChooseManual: () => void;
  onChooseTemplate: () => void;
  onOpenSaved: () => void;
  /** Resume the site currently open in the editor. Omit when there is nothing to resume. */
  onContinue?: () => void;
}

// One visual system for all three options: the same glass card, the same brand accent (the logo's blue-to-purple).
const ACCENT_TILE = 'bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg shadow-blue-500/30';
const ACCENT_GLOW = 'rgba(139, 92, 246, 0.45)';
const CARD_BASE = 'group relative overflow-hidden rounded-3xl border border-white/15 bg-slate-900/70 p-8 text-left w-full h-full flex flex-col backdrop-blur-sm';

interface OptionCardProps {
  icon: React.ReactNode;
  title: string;
  body: string;
  benefit: string;
  benefitIcon: React.ReactNode;
  badge?: string;
  onClick: () => void;
  delay: number;
  from: { x?: number; y?: number };
  reduceMotion: boolean | null;
}

function OptionCard({ icon, title, body, benefit, benefitIcon, badge, onClick, delay, from, reduceMotion }: OptionCardProps) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, ...from }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ delay, duration: 0.6, ease: 'easeOut' }}
      className="h-full"
    >
      <MagneticButton onClick={onClick} strength={0.15} className="w-full h-full">
        <SpotlightCard className={CARD_BASE} glow={ACCENT_GLOW}>
          <div className="relative z-10 flex flex-col flex-1">
            {/* Badge row is always present so every title sits on the same line */}
            <div className="h-6 mb-3">
              {badge && (
                <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide text-blue-200 bg-blue-400/15 border border-blue-300/30 rounded-full">
                  {badge}
                </span>
              )}
            </div>
            <div className={`spot-icon inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5 text-white ${ACCENT_TILE}`}>
              {icon}
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            <p className="text-sm leading-relaxed text-slate-300 mb-5 flex-1">{body}</p>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-200">
              {benefitIcon}
              <span>{benefit}</span>
            </div>
          </div>
        </SpotlightCard>
      </MagneticButton>
    </motion.div>
  );
}

export function WelcomeScreen({ onChooseAI, onChooseManual, onChooseTemplate, onOpenSaved, onContinue }: WelcomeScreenProps) {
  const prefersReducedMotion = useReducedMotion();
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  const reduceMotion = hydrated && prefersReducedMotion;
  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20 pb-8 overflow-hidden relative bg-slate-950">
      <nav aria-label="Account" className="absolute right-4 top-4 z-20">
        <AccountControls dark />
      </nav>
      {/* Atmospheric background */}
      <AtmosphereBackdrop />

      {/* Floating 3D shapes */}
      {!reduceMotion && <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {/* Floating cube */}
        <motion.div
          className="absolute top-[15%] left-[10%]"
          animate={{ y: [0, -30, 0], rotate: [0, 360] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-16 h-16 rounded-xl border border-blue-400/20"
            style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))', backdropFilter: 'blur(10px)' }}
          />
        </motion.div>

        {/* Floating sphere */}
        <motion.div
          className="absolute top-[20%] right-[12%]"
          animate={{ y: [0, 40, 0], x: [0, -20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-20 h-20 rounded-full border border-purple-400/20"
            style={{ background: 'radial-gradient(circle at 30% 30%, rgba(139,92,246,0.15), rgba(236,72,153,0.05))', backdropFilter: 'blur(10px)' }}
          />
        </motion.div>

        {/* Floating triangle */}
        <motion.div
          className="absolute bottom-[20%] left-[15%]"
          animate={{ y: [0, -25, 0], rotate: [0, -360] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div
            className="w-0 h-0"
            style={{
              borderLeft: '28px solid transparent',
              borderRight: '28px solid transparent',
              borderBottom: '48px solid rgba(236,72,153,0.08)',
              filter: 'drop-shadow(0 0 20px rgba(236,72,153,0.1))',
            }}
          />
        </motion.div>

        {/* Floating ring */}
        <motion.div
          className="absolute bottom-[25%] right-[18%]"
          animate={{ y: [0, 35, 0], x: [0, 15, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-24 h-24 rounded-full border-2 border-cyan-400/15" style={{ backdropFilter: 'blur(5px)' }} />
        </motion.div>

        {/* Small floating dots */}
        {[
          { top: '30%', left: '45%', delay: 0, size: 6 },
          { top: '60%', left: '50%', delay: 2, size: 8 },
          { top: '40%', left: '80%', delay: 1, size: 5 },
          { top: '70%', left: '30%', delay: 3, size: 7 },
          { top: '25%', left: '65%', delay: 1.5, size: 4 },
        ].map((dot, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/30"
            style={{ top: dot.top, left: dot.left, width: dot.size, height: dot.size }}
            animate={{ y: [0, -20, 0], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 4 + i, repeat: Infinity, ease: 'easeInOut', delay: dot.delay }}
          />
        ))}
      </div>}

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo / Title */}
        <motion.div
          className="text-center mb-12"
          initial={reduceMotion ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 mb-4 shadow-lg shadow-blue-500/30"
            animate={reduceMotion ? { rotate: 0 } : { rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <LayoutGrid className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Portfolio Builder
          </h1>
          <motion.p
            className="text-lg text-blue-200/80 max-w-xl mx-auto"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Create a stunning website in minutes. Choose how you'd like to get started.
          </motion.p>
        </motion.div>

        <div className="mb-6 flex justify-center">
          <SavedWebsites dark signInPrompt onOpened={onOpenSaved} />
        </div>

        {/* Three options */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          <OptionCard
            icon={<Wand2 className="w-7 h-7" />}
            title="Build with AI"
            badge="Recommended"
            body="Describe your business in plain words. The AI assistant drafts the sections, theme and content for you to edit."
            benefit="Ready in about a minute"
            benefitIcon={<Sparkles className="w-4 h-4" />}
            onClick={onChooseAI}
            delay={0.5}
            from={{ x: -40 }}
            reduceMotion={reduceMotion}
          />
          <OptionCard
            icon={<LayoutGrid className="w-7 h-7" />}
            title="Build Manually"
            body="Start from a blank page and add sections one at a time. Full control over layout, colors and content."
            benefit="Full creative control"
            benefitIcon={<LayoutGrid className="w-4 h-4" />}
            onClick={onChooseManual}
            delay={0.7}
            from={{ x: 40 }}
            reduceMotion={reduceMotion}
          />
          <OptionCard
            icon={<LayoutTemplate className="w-7 h-7" />}
            title="Use a Template"
            body="Choose a pre-built layout for your field, then make it yours. A fast start with a professional look."
            benefit="Start fast, customize later"
            benefitIcon={<LayoutTemplate className="w-4 h-4" />}
            onClick={onChooseTemplate}
            delay={0.9}
            from={{ y: 40 }}
            reduceMotion={reduceMotion}
          />
        </div>

        {onContinue && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onContinue}
              className="rounded-full border border-white/20 px-5 py-2 text-sm text-blue-100 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              Continue editing current site
            </button>
          </div>
        )}

        {/* Footer */}
        <motion.div
          className="text-center text-blue-200/50 text-xs mt-8 space-y-1"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p>You can switch between AI and manual editing at any time</p>
          <p>
            This site is protected by reCAPTCHA and the Google{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">Privacy Policy</a>
            {' '}and{' '}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-100">Terms of Service</a>
            {' '}apply.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

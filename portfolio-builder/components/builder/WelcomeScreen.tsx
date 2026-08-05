'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Wand2, LayoutGrid, Sparkles, LayoutTemplate } from 'lucide-react';
import { MagneticButton } from './effects/MagneticButton';

interface WelcomeScreenProps {
  onChooseAI: () => void;
  onChooseManual: () => void;
  onChooseTemplate: () => void;
}

export function WelcomeScreen({ onChooseAI, onChooseManual, onChooseTemplate }: WelcomeScreenProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative bg-slate-950">
      {/* Animated gradient background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950" />
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)' }}
          animate={{ x: [0, 100, 0], y: [0, 50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[800px] h-[800px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }}
          animate={{ x: [0, -100, 0], y: [0, -50, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)' }}
          animate={{ x: [0, -80, 0], y: [0, 80, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Floating 3D shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
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
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full max-w-4xl">
        {/* Logo / Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-500 mb-4 shadow-lg shadow-blue-500/30"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <LayoutGrid className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Portfolio Builder
          </h1>
          <motion.p
            className="text-lg text-blue-200/80 max-w-xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Create a stunning website in minutes. Choose how you'd like to get started.
          </motion.p>
        </motion.div>

        {/* Three options */}
        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {/* AI Builder Option */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.6, ease: 'easeOut' }}
            className="h-full"
          >
            <MagneticButton onClick={onChooseAI} strength={0.15} className="w-full h-full">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30 w-full h-full flex flex-col">
                {/* Shimmer effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 group-hover:translate-x-[200%] transition-transform duration-1000" />
                </div>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-5">
                    <Wand2 className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">Build with AI</h2>
                    <span className="px-2 py-0.5 text-xs font-semibold bg-white/20 text-white rounded-full">
                      Recommended
                    </span>
                  </div>
                  <p className="text-blue-100/90 text-sm leading-relaxed mb-4 flex-1">
                    Describe your business or website idea in plain words. Our AI assistant will create a complete website with the right sections, theme, and content — ready for you to customize.
                  </p>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Takes less than a minute</span>
                  </div>
                </div>
              </div>
            </MagneticButton>
          </motion.div>

          {/* Manual Builder Option */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6, ease: 'easeOut' }}
            className="h-full"
          >
            <MagneticButton onClick={onChooseManual} strength={0.15} className="w-full h-full">
              <div className="group relative overflow-hidden rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 p-8 text-left transition-all hover:scale-[1.02] hover:bg-white/15 hover:shadow-2xl w-full h-full flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/5 blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm mb-5">
                    <LayoutGrid className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">Build Manually</h2>
                  </div>
                  <p className="text-blue-100/70 text-sm leading-relaxed mb-4 flex-1">
                    Start from scratch and build your website section by section. Full control over layout, colors, content, and every detail. Perfect if you know exactly what you want.
                  </p>
                  <div className="flex items-center gap-2 text-white/60 text-sm">
                    <LayoutGrid className="w-4 h-4" />
                    <span>Full creative control</span>
                  </div>
                </div>
              </div>
            </MagneticButton>
          </motion.div>

          {/* Template Gallery Option */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6, ease: 'easeOut' }}
            className="h-full"
          >
            <MagneticButton onClick={onChooseTemplate} strength={0.15} className="w-full h-full">
              <div className="group relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-600 p-8 text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/30 w-full h-full flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full bg-white/10 blur-2xl group-hover:scale-150 transition-transform duration-500" />
                <div className="relative z-10 flex flex-col flex-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm mb-5">
                    <LayoutTemplate className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-2xl font-bold text-white">Use a Template</h2>
                  </div>
                  <p className="text-emerald-100/90 text-sm leading-relaxed mb-4 flex-1">
                    Browse pre-built templates designed for different use cases. Pick one and customize it to make it yours. A great starting point with professional layouts.
                  </p>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <LayoutTemplate className="w-4 h-4" />
                    <span>Start fast, customize later</span>
                  </div>
                </div>
              </div>
            </MagneticButton>
          </motion.div>
        </div>

        {/* Footer */}
        <motion.p
          className="text-center text-blue-200/50 text-xs mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          You can switch between AI and manual editing at any time
        </motion.p>
      </div>
    </div>
  );
}

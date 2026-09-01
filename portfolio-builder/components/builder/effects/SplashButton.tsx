'use client';

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SplashButtonProps {
  text: string;
  link: string;
  color: string;
  position: 'bottom-center' | 'bottom-right' | 'bottom-left';
}

/**
 * A floating CTA button that appears at the bottom of the screen with a
 * gentle pulsing animation. When clicked, a liquid splash ripple expands
 * outward from the button, then the link is navigated to.
 */
export function SplashButton({ text, link, color, position }: SplashButtonProps) {
  const [splashing, setSplashing] = useState(false);

  const positionClasses: Record<string, string> = {
    'bottom-center': 'left-1/2 -translate-x-1/2',
    'bottom-right': 'right-6',
    'bottom-left': 'left-6',
  };

  const handleClick = useCallback(() => {
    setSplashing(true);
    // Navigate after the splash animation completes
    setTimeout(() => {
      setSplashing(false);
      if (link.startsWith('#')) {
        const linkId = link.slice(1);
        let el = document.getElementById(linkId.startsWith('section-') ? linkId : `section-${linkId}`);
        if (!el) {
          const sections = document.querySelectorAll('[data-section-type]');
          for (const s of sections) {
            if (s.getAttribute('data-section-type') === linkId) { el = s as HTMLElement; break; }
          }
        }
        el?.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.open(link, '_blank', 'noopener,noreferrer');
      }
    }, 600);
  }, [link]);

  return (
    <>
      {/* Splash ripple overlay */}
      <AnimatePresence>
        {splashing && (
          <motion.div
            className="fixed pointer-events-none z-[199]"
            style={{
              left: '50%',
              top: '50%',
              borderRadius: '50%',
              backgroundColor: color,
            }}
            initial={{ width: 0, height: 0, x: '-50%', y: '-50%', opacity: 0.6 }}
            animate={{ width: '300vw', height: '300vw', opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* The floating button */}
      <motion.div
        className={`fixed bottom-8 z-[200] ${positionClasses[position]}`}
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20, delay: 0.5 }}
      >
        <motion.button
          onClick={handleClick}
          className="relative px-8 py-4 rounded-full font-semibold text-white shadow-2xl overflow-hidden"
          style={{ backgroundColor: color }}
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            scale: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Liquid blob background animation */}
          <motion.span
            className="absolute inset-0 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3) 0%, transparent 60%)`,
            }}
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <span className="relative z-10">{text}</span>
        </motion.button>
      </motion.div>
    </>
  );
}

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * A cartoon character animation showing a wizard using a magic wand
 * to create a website. Built entirely with SVG + Framer Motion.
 */
export function MagicWandAnimation({ className }: { className?: string }) {
  return (
    <div className={className} style={{ width: 200, height: 160 }}>
      <svg viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* === Website mockup that appears from magic === */}
        <motion.g
          initial={{ opacity: 0, scale: 0, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.6, ease: 'easeOut' }}
        >
          {/* Browser window */}
          <rect x="120" y="20" width="70" height="55" rx="4" fill="white" stroke="#e0e0e0" strokeWidth="1.5" />
          {/* Browser top bar */}
          <rect x="120" y="20" width="70" height="10" rx="4" fill="#f0f0f0" />
          <circle cx="126" cy="25" r="1.5" fill="#ff6b6b" />
          <circle cx="131" cy="25" r="1.5" fill="#ffd93d" />
          <circle cx="136" cy="25" r="1.5" fill="#6bcf7f" />

          {/* Website content blocks */}
          <motion.rect
            x="126" y="35" width="58" height="6" rx="2"
            fill="#6366f1"
            initial={{ width: 0 }}
            animate={{ width: 58 }}
            transition={{ delay: 1.8, duration: 0.4 }}
          />
          <motion.rect
            x="126" y="45" width="40" height="3" rx="1"
            fill="#d1d5db"
            initial={{ width: 0 }}
            animate={{ width: 40 }}
            transition={{ delay: 2.0, duration: 0.3 }}
          />
          <motion.rect
            x="126" y="51" width="50" height="3" rx="1"
            fill="#d1d5db"
            initial={{ width: 0 }}
            animate={{ width: 50 }}
            transition={{ delay: 2.1, duration: 0.3 }}
          />
          {/* Image placeholder */}
          <motion.rect
            x="126" y="58" width="25" height="12" rx="2"
            fill="#e0e7ff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.3, duration: 0.3 }}
          />
          <motion.rect
            x="155" y="58" width="29" height="12" rx="2"
            fill="#e0e7ff"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.4, duration: 0.3 }}
          />
        </motion.g>

        {/* === Magic sparkles from wand to website === */}
        {[0, 1, 2, 3, 4].map((i) => (
          <motion.circle
            key={`sparkle-${i}`}
            r="2"
            fill="#fbbf24"
            initial={{ opacity: 0, cx: 95, cy: 75 }}
            animate={{
              opacity: [0, 1, 0],
              cx: [95, 110 + i * 8, 125 + i * 5],
              cy: [75, 60 + i * 3, 50 + i * 2],
            }}
            transition={{
              delay: 1.2 + i * 0.15,
              duration: 0.8,
              repeat: Infinity,
              repeatDelay: 2,
            }}
          />
        ))}

        {/* === Cartoon wizard character === */}
        <g>
          {/* Body (robe) */}
          <motion.path
            d="M 40 100 Q 30 120 35 140 L 85 140 Q 90 120 80 100 Z"
            fill="#4f46e5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          />
          {/* Robe stars decoration */}
          <text x="50" y="120" fontSize="6" fill="#a5b4fc">✦</text>
          <text x="68" y="125" fontSize="5" fill="#a5b4fc">✦</text>
          <text x="58" y="132" fontSize="4" fill="#a5b4fc">✦</text>

          {/* Head */}
          <motion.circle
            cx="60" cy="85" r="14"
            fill="#fde68a"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          />

          {/* Eyes */}
          <circle cx="55" cy="83" r="2" fill="#1e293b" />
          <circle cx="65" cy="83" r="2" fill="#1e293b" />
          {/* Eye shine */}
          <circle cx="55.5" cy="82.5" r="0.6" fill="white" />
          <circle cx="65.5" cy="82.5" r="0.6" fill="white" />

          {/* Smile */}
          <path d="M 55 89 Q 60 92 65 89" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" />

          {/* Cheeks */}
          <circle cx="52" cy="88" r="2" fill="#fca5a5" opacity="0.5" />
          <circle cx="68" cy="88" r="2" fill="#fca5a5" opacity="0.5" />

          {/* Wizard hat */}
          <motion.g
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <path d="M 60 72 L 48 50 L 72 50 Z" fill="#4338ca" />
            <path d="M 48 50 Q 60 46 72 50" fill="#3730a3" />
            {/* Hat star */}
            <text x="57" y="60" fontSize="7" fill="#fbbf24">★</text>
            {/* Hat tip ball */}
            <circle cx="48" cy="50" r="2.5" fill="#fbbf24" />
          </motion.g>

          {/* Arms */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            {/* Left arm (holding wand) */}
            <motion.g
              animate={{ rotate: [0, -5, 0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '45px 105px' }}
            >
              <path d="M 45 105 Q 55 95 70 80" stroke="#4f46e5" strokeWidth="6" strokeLinecap="round" fill="none" />
              {/* Hand */}
              <circle cx="70" cy="80" r="4" fill="#fde68a" />
            </motion.g>
            {/* Right arm */}
            <path d="M 75 105 Q 82 110 85 120" stroke="#4f46e5" strokeWidth="6" strokeLinecap="round" fill="none" />
            <circle cx="85" cy="120" r="4" fill="#fde68a" />
          </motion.g>

          {/* Magic wand */}
          <motion.g
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.5 }}
          >
            <motion.g
              animate={{ rotate: [0, -8, 0, -8, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
              style={{ transformOrigin: '70px 80px' }}
            >
              {/* Wand stick */}
              <line x1="70" y1="80" x2="95" y2="60" stroke="#92400e" strokeWidth="2.5" strokeLinecap="round" />
              {/* Wand tip star */}
              <motion.g
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformOrigin: '95px 60px' }}
              >
                <text x="91" y="64" fontSize="10" fill="#fbbf24">✦</text>
              </motion.g>
              {/* Wand glow */}
              <motion.circle
                cx="95" cy="60" r="6"
                fill="#fbbf24" opacity="0.3"
                animate={{ r: [4, 8, 4], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              />
            </motion.g>
          </motion.g>
        </g>

        {/* === Floating magic particles around character === */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <motion.text
            key={`particle-${i}`}
            fontSize={3 + (i % 3)}
            fill="#fbbf24"
            initial={{
              opacity: 0,
              x: 30 + (i * 12),
              y: 100 + (i % 2) * 20,
            }}
            animate={{
              opacity: [0, 1, 0],
              y: [100 + (i % 2) * 20, 80 + (i % 3) * 10, 60],
              x: [30 + (i * 12), 35 + (i * 10), 40 + (i * 8)],
            }}
            transition={{
              duration: 2 + i * 0.3,
              repeat: Infinity,
              delay: i * 0.4,
              ease: 'easeOut',
            }}
          >
            ✦
          </motion.text>
        ))}
      </svg>
    </div>
  );
}

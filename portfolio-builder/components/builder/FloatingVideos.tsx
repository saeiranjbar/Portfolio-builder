'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const VIDEOS = [
  '/vid2.mp4', '/vid3.mp4', '/vid4.mp4', '/vid5.mp4', '/vid6.mp4', '/vid7.mp4',
  '/vid8.mp4', '/vid9.mp4', '/vid10.mp4', '/vid11.mp4', '/vid12.mp4',
  '/vid13.mp4', '/vid14.mp4', '/vid15.mp4', '/vid16.mp4', '/vid17.mp4',
];

const VIDEO_WIDTH = 330; // px (50% bigger)
const VIDEO_HEIGHT = 198; // px (aspect ratio ~ 5:3)
const VIDEO_GAP = 16; // px between videos
const SLIDE_DURATION = 120; // seconds for one full loop — slower slide

/**
 * FloatingVideos
 *
 * Displays ALL videos in a single horizontal row whose vertical center sits at
 * the 1/3 mark of the questionnaire card. The row slowly slides horizontally
 * (infinite marquee).
 */
export function FloatingVideos({ active }: { active: boolean }) {
  const [rowY, setRowY] = useState<number | null>(null);
  const [rowWidth, setRowWidth] = useState(0);
  const rafRef = useRef<number | null>(null);

  // Compute the vertical position: center of the row = 1/3 down the card
  const computeRowY = useCallback(() => {
    if (typeof window === 'undefined') return;
    const card = document.querySelector('[data-wizard-card]') as HTMLElement | null;
    if (card) {
      const rect = card.getBoundingClientRect();
      // 1/3 from the BOTTOM of the card = 2/3 from the top
      setRowY(rect.top + (rect.height * 2) / 3);
    } else {
      // Fallback: 1/3 of viewport
      setRowY(window.innerHeight / 3);
    }
  }, []);

  // Compute the width of a single set of videos (for seamless loop)
  useEffect(() => {
    const singleSetWidth =
      VIDEOS.length * VIDEO_WIDTH + (VIDEOS.length - 1) * VIDEO_GAP;
    setRowWidth(singleSetWidth);
  }, []);

  // Track card position (it animates in, so we poll for the first second)
  useEffect(() => {
    if (!active) {
      setRowY(null);
      return;
    }

    computeRowY();

    // Poll position for ~1.5s while the card animates in, then settle
    let polls = 0;
    const maxPolls = 30;
    const pollInterval = setInterval(() => {
      computeRowY();
      polls += 1;
      if (polls >= maxPolls) clearInterval(pollInterval);
    }, 50);

    const onResize = () => computeRowY();
    window.addEventListener('resize', onResize);

    return () => {
      clearInterval(pollInterval);
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [active, computeRowY]);

  if (!active || rowY === null || rowWidth === 0) return null;

  // Duplicate the video set so the marquee loops seamlessly
  const renderVideoSet = (keyPrefix: string) =>
    VIDEOS.map((src, i) => (
      <div
        key={`${keyPrefix}-${i}`}
        style={{
          width: VIDEO_WIDTH,
          height: VIDEO_HEIGHT,
          marginRight: VIDEO_GAP,
          flexShrink: 0,
        }}
      >
        <video
          src={src}
          muted
          playsInline
          autoPlay
          loop
          className="rounded-xl shadow-xl"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            opacity: 0.7,
          }}
        />
      </div>
    ));

  return (
    <div
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Edge fade masks on left & right */}
      <div
        className="absolute top-0 bottom-0 left-0 w-32 z-10"
        style={{ background: 'linear-gradient(to right, #f5f5f7, transparent)' }}
      />
      <div
        className="absolute top-0 bottom-0 right-0 w-32 z-10"
        style={{ background: 'linear-gradient(to left, #f5f5f7, transparent)' }}
      />

      {/* The sliding row — positioned so its vertical center is at rowY */}
      <motion.div
        className="absolute left-0 flex items-center"
        style={{
          top: `${rowY}px`,
          transform: 'translateY(-50%)',
          willChange: 'transform',
        }}
        animate={{
          x: [0, -rowWidth],
        }}
        transition={{
          duration: SLIDE_DURATION,
          ease: 'linear',
          repeat: Infinity,
        }}
      >
        {/* First set */}
        <div className="flex items-center">{renderVideoSet('a')}</div>
        {/* Duplicate set for seamless loop */}
        <div className="flex items-center">{renderVideoSet('b')}</div>
      </motion.div>
    </div>
  );
}

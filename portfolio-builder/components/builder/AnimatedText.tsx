'use client';

import React from 'react';
import { TextStyleSettings } from '@/lib/types';

interface AnimatedTextProps {
  text: string;
  style?: React.CSSProperties;
  textStyles?: TextStyleSettings;
  className?: string;
}

/**
 * Renders text with optional word-by-word color reveal animation.
 * When animationType is 'wordColorReveal', each word transitions from
 * animationFromColor to animationToColor with a stagger delay.
 */
export function AnimatedText({ text, style, textStyles, className }: AnimatedTextProps) {
  // If no animation or no text, just render plain
  if (!textStyles?.animationType || textStyles.animationType === 'none' || !text) {
    return <span className={className} style={style}>{text}</span>;
  }

  if (textStyles.animationType === 'wordColorReveal') {
    const fromColor = textStyles.animationFromColor || '#808080';
    const toColor = textStyles.animationToColor || '#ffffff';
    const duration = typeof textStyles.animationDuration === 'string'
      ? parseFloat(textStyles.animationDuration) || 0.8
      : textStyles.animationDuration ?? 0.8;
    const stagger = typeof textStyles.animationStagger === 'string'
      ? parseFloat(textStyles.animationStagger) || 0.15
      : textStyles.animationStagger ?? 0.15;

    const words = text.split(' ');

    return (
      <span className={className} style={style}>
        {words.map((word, i) => (
          <React.Fragment key={i}>
            <span
              className="word-reveal-word"
              style={{
                // CSS custom properties for the keyframe animation
                ['--word-from-color' as string]: fromColor,
                ['--word-to-color' as string]: toColor,
                ['--word-duration' as string]: `${duration}s`,
                ['--word-delay' as string]: `${i * stagger}s`,
                // Start at the from-color so there's no flash of wrong color
                color: fromColor,
              }}
            >
              {word}
            </span>
            {i < words.length - 1 && ' '}
          </React.Fragment>
        ))}
      </span>
    );
  }

  return <span className={className} style={style}>{text}</span>;
}

'use client';

import React from 'react';

interface BrandMascotProps {
  variant?: 'avatar' | 'hero' | 'guide';
  className?: string;
  size?: number | string;
  speechBubble?: string;
  speech?: string;
  animate?: boolean;
}

export default function BrandMascot({
  variant = 'avatar',
  className = '',
  size = 48,
  speechBubble,
  speech,
  animate = false,
}: BrandMascotProps) {
  const displaySpeech = speech || speechBubble;
  if (variant === 'guide') {
    return (
      <div className={`rounded-2xl overflow-hidden border border-zinc-200 shadow-md ${className}`}>
        <img
          src="/brand/goeuro_mascot_guide.jpg"
          alt="GOEURO Mascot Detailed Closeup Guide"
          className="w-full h-auto object-cover"
        />
      </div>
    );
  }

  if (variant === 'hero') {
    return (
      <div className={`relative inline-flex flex-col items-center ${className}`}>
        {displaySpeech && (
          <div className="mb-2 px-3 py-1.5 rounded-2xl bg-white/95 backdrop-blur-md border border-purple-200 text-purple-900 text-xs font-bold shadow-lg animate-bounce flex items-center space-x-1.5 z-10">
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-ping" />
            <span>{displaySpeech}</span>
          </div>
        )}
        <div className={`relative overflow-hidden rounded-3xl ${animate ? 'hover-lift transition duration-300' : ''}`}>
          <img
            src="/brand/mascot_hero.png"
            alt="EuroBot — GOEURO AI Study Mascot"
            className="w-full h-auto object-contain max-h-72 drop-shadow-2xl"
          />
        </div>
      </div>
    );
  }

  // Default 'avatar'
  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <img
        src="/brand/mascot_avatar_circle.png"
        alt="EuroBot Avatar"
        width={typeof size === 'number' ? size : 40}
        height={typeof size === 'number' ? size : 40}
        className="rounded-full shadow-xs ring-2 ring-purple-500/50 hover:ring-purple-600 transition"
      />
    </div>
  );
}

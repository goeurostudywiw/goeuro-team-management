'use client';

import React from 'react';
import Image from 'next/image';

interface BrandLogoProps {
  variant?: 'light' | 'dark' | 'icon';
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  showBadge?: boolean;
}

export default function BrandLogo({
  variant = 'light',
  className = '',
  width,
  height,
  priority = false,
}: BrandLogoProps) {
  if (variant === 'icon') {
    return (
      <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
        <img
          src="/brand/goeuro_mark.png"
          alt="GOEURO Logo Mark"
          width={width || 36}
          height={height || 36}
          className="object-contain"
        />
      </div>
    );
  }

  const src = variant === 'dark' ? '/brand/goeuro_logo_dark.png' : '/brand/goeuro_logo_clean.png';

  return (
    <div className={`relative inline-flex items-center shrink-0 ${className}`}>
      <img
        src={src}
        alt="GOEURO STUDY"
        width={width || 160}
        height={height || 54}
        className="object-contain h-auto max-w-full"
      />
    </div>
  );
}

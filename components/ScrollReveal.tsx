'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: 'slide-up' | 'fade-in' | 'scale-in' | 'tilt-in';
  delayMs?: number;
  delay?: number;
}

export default function ScrollReveal({
  children,
  className = '',
  animation = 'slide-up',
  delayMs = 0,
  delay = 0,
}: ScrollRevealProps) {
  const effectiveDelay = delay || delayMs || 0;
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -40px 0px',
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const getTransitionStyle = () => {
    if (!isVisible) {
      if (animation === 'slide-up') {
        return {
          opacity: 0,
          transform: 'translateY(36px)',
          transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms`,
        };
      }
      if (animation === 'scale-in') {
        return {
          opacity: 0,
          transform: 'scale(0.94) translateY(20px)',
          transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms`,
        };
      }
      if (animation === 'tilt-in') {
        return {
          opacity: 0,
          transform: 'perspective(1000px) rotateX(8deg) translateY(30px)',
          transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms`,
        };
      }
      return {
        opacity: 0,
        transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms`,
      };
    }

    return {
      opacity: 1,
      transform: 'none',
      transition: `opacity 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms, transform 0.75s cubic-bezier(0.16, 1, 0.3, 1) ${effectiveDelay}ms`,
    };
  };

  return (
    <div
      ref={ref}
      style={getTransitionStyle()}
      className={`will-change-[opacity,transform] ${className}`}
    >
      {children}
    </div>
  );
}

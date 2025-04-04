"use client";

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export function StarsBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Static background gradient - darker colors as requested */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#101035] via-[#0A0A1A] to-[#050510]"></div>
      
      {/* Animated star layers */}
      <StarField count={150} speed={0.05} size={1} />
      <StarField count={100} speed={0.1} size={1.5} />
      <StarField count={50} speed={0.2} size={2} />
      
      {/* Moving nebula effect */}
      <motion.div 
        className="absolute inset-0 opacity-10"
        style={{
          background: 'radial-gradient(circle at 30% 50%, rgba(147, 112, 219, 0.2), transparent 45%), radial-gradient(circle at 70% 40%, rgba(3, 218, 198, 0.2), transparent 40%)',
        }}
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.08, 0.12, 0.08],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          repeatType: "reverse",
        }}
      />
    </div>
  );
}

interface StarFieldProps {
  count: number;
  speed: number;
  size: number;
}

function StarField({ count, speed, size }: StarFieldProps) {
  const starsRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (!starsRef.current) return;
    
    const stars: HTMLDivElement[] = [];
    const container = starsRef.current;
    
    // Create stars
    for (let i = 0; i < count; i++) {
      const star = document.createElement('div');
      
      // Randomize star styles
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const delay = Math.random() * 15;
      const duration = 15 + Math.random() * 20;
      const opacity = 0.2 + Math.random() * 0.8;
      const starSize = size * (0.5 + Math.random() * 0.5);
      
      star.className = 'absolute rounded-full bg-white';
      star.style.top = `${y}%`;
      star.style.left = `${x}%`;
      star.style.width = `${starSize}px`;
      star.style.height = `${starSize}px`;
      star.style.opacity = opacity.toString();
      star.style.animation = `twinkle ${duration}s ${delay}s infinite ease-in-out`;
      
      stars.push(star);
      container.appendChild(star);
    }
    
    // Cleanup
    return () => {
      stars.forEach(star => star.remove());
    };
  }, [count, size]);
  
  return (
    <>
      <style jsx global>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
      <div ref={starsRef} className="absolute inset-0"></div>
    </>
  );
}
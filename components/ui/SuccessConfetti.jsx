// components/ui/SuccessConfetti.jsx
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const getRandomColor = () => {
  const colors = [
    '#FFD700', // gold
    '#FF6B6B', // red
    '#4CAF50', // green
    '#64B5F6', // blue
    '#BA68C8', // purple
    '#FFB74D', // orange
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

const ConfettiPiece = ({ delay, duration, left, size }) => {
  const randomRotation = Math.random() * 360;
  
  return (
    <motion.div
      className="absolute z-50 opacity-80"
      style={{
        left: `${left}%`,
        top: '-20px',
        width: `${size}px`,
        height: `${size}px`,
        backgroundColor: getRandomColor(),
        borderRadius: Math.random() > 0.5 ? '50%' : '0%',
        rotate: `${randomRotation}deg`,
      }}
      initial={{ y: -20, opacity: 0 }}
      animate={{
        y: ['0%', '100vh'],
        x: [`0%`, `${(Math.random() * 30) - 15}%`],
        rotate: [`${randomRotation}deg`, `${randomRotation + (Math.random() * 360)}deg`],
        opacity: [1, 1, 0],
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.1, 0.25, 0.3, 1],
      }}
    />
  );
};

const EmojiBurst = ({ delay }) => {
  const emojis = ['🎉', '🎊', '✨', '🔥', '👑', '💎', '🚀', '⭐', '🏆'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
  const randomLeft = Math.random() * 80 + 10;
  const randomSize = Math.random() * 30 + 20;
  
  return (
    <motion.div
      className="absolute z-50 text-4xl"
      style={{
        left: `${randomLeft}%`,
        top: '30%',
      }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{
        scale: [0, 1.5, 1],
        rotate: [0, -20, 20, 0],
        y: [0, -50, 100],
      }}
      transition={{
        duration: 2,
        delay: delay,
        ease: "easeOut",
      }}
    >
      {randomEmoji}
    </motion.div>
  );
};

export default function SuccessConfetti({ isVisible, duration = 4 }) {
  const [pieces, setPieces] = useState([]);
  const [emojis, setEmojis] = useState([]);
  
  useEffect(() => {
    if (isVisible) {
      // Generate confetti pieces
      const newPieces = [];
      for (let i = 0; i < 50; i++) {
        newPieces.push({
          id: i,
          delay: Math.random() * 0.8,
          duration: Math.random() * 2 + 2,
          left: Math.random() * 100,
          size: Math.random() * 10 + 8,
        });
      }
      setPieces(newPieces);
      
      // Generate emoji bursts
      const newEmojis = [];
      for (let i = 0; i < 10; i++) {
        newEmojis.push({
          id: i,
          delay: Math.random() * 1.5,
        });
      }
      setEmojis(newEmojis);
      
      // Clean up after animation duration
      const timer = setTimeout(() => {
        setPieces([]);
        setEmojis([]);
      }, duration * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration]);
  
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {/* Background flash */}
      <motion.div
        className="absolute inset-0 bg-black bg-opacity-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 1.5 }}
      />
      
      {/* Center burst */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="w-32 h-32 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-80"
          initial={{ scale: 0 }}
          animate={{ 
            scale: [0, 2, 0],
            opacity: [0, 0.8, 0]
          }}
          transition={{ duration: 1.2 }}
        />
      </div>
      
      {/* Success text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1],
            opacity: [0, 1, 1, 0] 
          }}
          transition={{ 
            duration: 2,
            times: [0, 0.3, 0.5, 1] 
          }}
          className="text-4xl font-bold text-white text-center"
        >
          SUCCESS!
        </motion.div>
      </div>
      
      {/* Falling confetti */}
      {pieces.map((piece) => (
        <ConfettiPiece key={piece.id} {...piece} />
      ))}
      
      {/* Emoji bursts */}
      {emojis.map((emoji) => (
        <EmojiBurst key={emoji.id} delay={emoji.delay} />
      ))}
    </div>
  );
}
'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { ReactNode } from 'react';

interface ParallaxBackgroundProps {
  children: ReactNode;
  layer1Color?: string;
  layer2Color?: string;
  showStars?: boolean;
}

/**
 * 2層パララックス背景
 * スクロールやマウス移動で奥行き感を演出
 */
export function ParallaxBackground({
  children,
  layer1Color = 'from-purple-900 via-blue-900 to-indigo-900',
  layer2Color = 'from-purple-800/50 via-blue-800/50 to-indigo-800/50',
  showStars = true,
}: ParallaxBackgroundProps) {
  const { scrollY } = useScroll();

  // レイヤー1: ゆっくり動く（遠景）
  const y1 = useTransform(scrollY, [0, 1000], [0, -100]);

  // レイヤー2: 速く動く（近景）
  const y2 = useTransform(scrollY, [0, 1000], [0, -300]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Layer 1 - 遠景 */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${layer1Color}`}
        style={{ y: y1 }}
      />

      {/* Stars - 中景 */}
      {showStars && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ y: y2 }}
        >
          <div
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{ top: '10%', left: '15%', animationDelay: '0s' }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full opacity-80 animate-pulse"
            style={{ top: '20%', left: '80%', animationDelay: '0.5s' }}
          />
          <div
            className="absolute w-1 h-1 bg-white rounded-full opacity-70 animate-pulse"
            style={{ top: '35%', left: '25%', animationDelay: '1s' }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full opacity-90 animate-pulse"
            style={{ top: '50%', left: '70%', animationDelay: '1.5s' }}
          />
          <div
            className="absolute w-1 h-1 bg-white rounded-full opacity-60 animate-pulse"
            style={{ top: '65%', left: '10%', animationDelay: '2s' }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full opacity-75 animate-pulse"
            style={{ top: '75%', left: '90%', animationDelay: '2.5s' }}
          />
          <div
            className="absolute w-1 h-1 bg-white rounded-full opacity-80 animate-pulse"
            style={{ top: '85%', left: '50%', animationDelay: '3s' }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full opacity-70 animate-pulse"
            style={{ top: '15%', left: '60%', animationDelay: '0.7s' }}
          />
          <div
            className="absolute w-1 h-1 bg-white rounded-full opacity-85 animate-pulse"
            style={{ top: '40%', left: '85%', animationDelay: '1.2s' }}
          />
          <div
            className="absolute w-2 h-2 bg-white rounded-full opacity-65 animate-pulse"
            style={{ top: '60%', left: '35%', animationDelay: '1.8s' }}
          />
        </motion.div>
      )}

      {/* Layer 2 - 近景（オプション） */}
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br ${layer2Color} opacity-30`}
        style={{ y: y2 }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * シンプルな動的背景（パララックスなし）
 */
export function AnimatedBackground({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`relative min-h-screen overflow-hidden ${className}`}>
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 animate-gradient" />

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-40"
            initial={{
              x: Math.random() * 100 + '%',
              y: Math.random() * 100 + '%',
            }}
            animate={{
              y: [null, Math.random() * 100 + '%'],
              x: [null, Math.random() * 100 + '%'],
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              repeatType: 'reverse',
              ease: 'linear',
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}

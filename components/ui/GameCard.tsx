'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { CardRarity } from '@/types';

interface GameCardProps {
  children?: ReactNode;
  rarity?: CardRarity;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  glowEffect?: boolean;
}

/**
 * ゲーム用カードコンポーネント
 * - ホバー時の3Dチルト効果
 * - レアリティ別の色とグロー
 * - スムーズなアニメーション
 */
export function GameCard({
  children,
  rarity = 'common',
  className,
  onClick,
  hoverable = true,
  glowEffect = true,
}: GameCardProps) {
  const rarityColors = {
    common: {
      border: 'border-gray-400',
      glow: 'shadow-gray-400/50',
      hoverGlow: 'hover:shadow-gray-400/80',
    },
    rare: {
      border: 'border-blue-400',
      glow: 'shadow-blue-400/50',
      hoverGlow: 'hover:shadow-blue-500/80',
    },
    super_rare: {
      border: 'border-purple-400',
      glow: 'shadow-purple-400/50',
      hoverGlow: 'hover:shadow-purple-500/80',
    },
    ultra_rare: {
      border: 'border-yellow-400',
      glow: 'shadow-yellow-400/50',
      hoverGlow: 'hover:shadow-yellow-500/80',
    },
  };

  const colors = rarityColors[rarity];

  return (
    <motion.div
      whileHover={
        hoverable
          ? {
              scale: 1.05,
              rotateY: 5,
              rotateX: -5,
              transition: { duration: 0.15 },
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl overflow-hidden',
        'border-2 transition-all duration-150',
        colors.border,
        glowEffect && colors.glow,
        hoverable && colors.hoverGlow,
        onClick && 'cursor-pointer',
        className
      )}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Inner glow effect */}
      {glowEffect && (
        <div
          className={cn(
            'absolute inset-0 opacity-0 hover:opacity-30 transition-opacity duration-150',
            'bg-gradient-to-br pointer-events-none',
            rarity === 'ultra_rare' && 'from-yellow-400 via-orange-400 to-yellow-400',
            rarity === 'super_rare' && 'from-purple-400 via-pink-400 to-purple-400',
            rarity === 'rare' && 'from-blue-400 via-cyan-400 to-blue-400',
            rarity === 'common' && 'from-gray-300 via-gray-400 to-gray-300'
          )}
        />
      )}

      {/* Content */}
      <div className="relative z-10">{children}</div>

      {/* Shine effect on hover */}
      {hoverable && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: '-100%' }}
          whileHover={{ x: '100%' }}
          transition={{ duration: 0.6 }}
        />
      )}
    </motion.div>
  );
}

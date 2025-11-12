'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, ReactNode } from 'react';
import { useSoundEffect } from '@/hooks/useAudio';
import { cn } from '@/lib/utils/cn';

interface GameButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  soundEnabled?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * ゲーム用ボタンコンポーネント
 * - プレス時のアニメーション
 * - SE再生
 * - レスポンシブなサイズ
 */
export function GameButton({
  children,
  variant = 'primary',
  size = 'md',
  soundEnabled = true,
  className,
  disabled,
  onClick,
  type = 'button',
}: GameButtonProps) {
  const playSe = useSoundEffect();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (soundEnabled && !disabled) {
      // TODO: 実際のSEファイルに置き換え
      // playSe('/sounds/button-click.mp3');
    }
    onClick?.(e);
  };

  const variantClasses = {
    primary: 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-blue-500/50',
    secondary: 'bg-gradient-to-br from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white shadow-gray-500/50',
    success: 'bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-green-500/50',
    danger: 'bg-gradient-to-br from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-red-500/50',
    warning: 'bg-gradient-to-br from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white shadow-yellow-500/50',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={handleClick}
      disabled={disabled}
      type={type}
      className={cn(
        'rounded-lg font-bold shadow-lg transition-all duration-150',
        'border-2 border-white/30',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </motion.button>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface FloatingNumberProps {
  value: number;
  x: number;
  y: number;
  color?: string;
  critical?: boolean;
  onComplete?: () => void;
}

/**
 * ダメージ数値などを浮かび上がらせて表示
 * バトルシーンでの与ダメ/被ダメ表示に使用
 */
export function FloatingNumber({
  value,
  x,
  y,
  color = '#ffffff',
  critical = false,
  onComplete,
}: FloatingNumberProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{
            opacity: 0,
            scale: critical ? 0.5 : 0.8,
            x,
            y,
          }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: critical ? [0.5, 1.3, 1.2, 1] : [0.8, 1.1, 1, 0.9],
            y: y - 60,
          }}
          exit={{
            opacity: 0,
          }}
          transition={{
            duration: 0.6,
            ease: 'easeOut',
          }}
          className="absolute pointer-events-none z-50"
          style={{
            left: x,
            top: y,
          }}
        >
          <div
            className={`
              font-bold drop-shadow-lg
              ${critical ? 'text-4xl' : 'text-2xl'}
            `}
            style={{
              color,
              textShadow: `
                0 0 10px ${color},
                0 0 20px ${color},
                2px 2px 4px rgba(0,0,0,0.8)
              `,
            }}
          >
            {critical && '💥 '}
            {value > 0 ? '+' : ''}
            {value}
            {critical && ' 💥'}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * 複数のFloatingNumberを管理するコンテナ
 */
interface FloatingNumber {
  id: string;
  value: number;
  x: number;
  y: number;
  color?: string;
  critical?: boolean;
}

interface FloatingNumberContainerProps {
  numbers: FloatingNumber[];
  onNumberComplete?: (id: string) => void;
}

export function FloatingNumberContainer({
  numbers,
  onNumberComplete,
}: FloatingNumberContainerProps) {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {numbers.map((num) => (
        <FloatingNumber
          key={num.id}
          value={num.value}
          x={num.x}
          y={num.y}
          color={num.color}
          critical={num.critical}
          onComplete={() => onNumberComplete?.(num.id)}
        />
      ))}
    </div>
  );
}

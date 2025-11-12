'use client';

import { useState, useEffect } from 'react';
import { useAudio } from '@/hooks/useAudio';
import { motion } from 'framer-motion';

/**
 * サウンドON/OFFトグルボタン
 * 画面右上などに固定配置する想定
 */
export function SoundToggle() {
  const { config, toggleBgmMute, toggleSeMute } = useAudio();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      {/* BGM Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleBgmMute}
        className={`
          w-12 h-12 rounded-full shadow-lg backdrop-blur-sm border-2
          flex items-center justify-center text-xl font-bold
          transition-colors
          ${
            config.isBgmMuted
              ? 'bg-gray-600/80 border-gray-400 text-gray-300'
              : 'bg-purple-600/80 border-purple-400 text-white'
          }
        `}
        title={config.isBgmMuted ? 'BGM OFF' : 'BGM ON'}
      >
        {config.isBgmMuted ? '🔇' : '🎵'}
      </motion.button>

      {/* SE Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleSeMute}
        className={`
          w-12 h-12 rounded-full shadow-lg backdrop-blur-sm border-2
          flex items-center justify-center text-xl font-bold
          transition-colors
          ${
            config.isSeMuted
              ? 'bg-gray-600/80 border-gray-400 text-gray-300'
              : 'bg-blue-600/80 border-blue-400 text-white'
          }
        `}
        title={config.isSeMuted ? 'SE OFF' : 'SE ON'}
      >
        {config.isSeMuted ? '🔕' : '🔔'}
      </motion.button>
    </div>
  );
}

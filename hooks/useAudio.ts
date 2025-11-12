import { useEffect, useState, useCallback } from 'react';
import { AudioManager } from '@/lib/audio/AudioManager';

/**
 * AudioManagerを使うためのReact Hook
 */
export function useAudio() {
  const [config, setConfig] = useState(AudioManager.getConfig());

  useEffect(() => {
    AudioManager.init();
    setConfig(AudioManager.getConfig());
  }, []);

  const playBgm = useCallback((src: string, loop = true) => {
    AudioManager.playBgm(src, loop);
  }, []);

  const stopBgm = useCallback(() => {
    AudioManager.stopBgm();
  }, []);

  const playSe = useCallback((src: string, volume?: number) => {
    AudioManager.playSe(src, volume);
  }, []);

  const toggleBgmMute = useCallback(() => {
    const muted = AudioManager.toggleBgmMute();
    setConfig(AudioManager.getConfig());
    return muted;
  }, []);

  const toggleSeMute = useCallback(() => {
    const muted = AudioManager.toggleSeMute();
    setConfig(AudioManager.getConfig());
    return muted;
  }, []);

  const setVolume = useCallback((type: 'bgm' | 'se', volume: number) => {
    AudioManager.setVolume(type, volume);
    setConfig(AudioManager.getConfig());
  }, []);

  return {
    playBgm,
    stopBgm,
    playSe,
    toggleBgmMute,
    toggleSeMute,
    setVolume,
    config,
  };
}

/**
 * SE再生専用の軽量Hook
 */
export function useSoundEffect() {
  useEffect(() => {
    AudioManager.init();
  }, []);

  return useCallback((src: string, volume?: number) => {
    AudioManager.playSe(src, volume);
  }, []);
}

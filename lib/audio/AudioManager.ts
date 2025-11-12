/**
 * AudioManager - ゲーム全体の音響を管理
 * BGM と SE を制御し、ミュート機能を提供
 */

type SoundType = 'bgm' | 'se';

interface AudioConfig {
  bgmVolume: number;
  seVolume: number;
  isBgmMuted: boolean;
  isSeMuted: boolean;
}

class AudioManagerClass {
  private bgm: HTMLAudioElement | null = null;
  private sePool: Map<string, HTMLAudioElement[]> = new Map();
  private config: AudioConfig = {
    bgmVolume: 0.6,
    seVolume: 0.9,
    isBgmMuted: false,
    isSeMuted: false,
  };
  private initialized = false;

  /**
   * 初期化（ユーザーインタラクション後に呼ぶ）
   */
  init() {
    if (this.initialized) return;

    // localStorageから設定を読み込む
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('audioConfig');
      if (saved) {
        this.config = { ...this.config, ...JSON.parse(saved) };
      }
    }

    this.initialized = true;
  }

  /**
   * BGMを再生
   */
  playBgm(src: string, loop = true) {
    if (!this.initialized) this.init();

    if (this.bgm?.src.includes(src)) {
      // 既に同じBGMが再生中
      return;
    }

    this.stopBgm();

    if (typeof window !== 'undefined') {
      this.bgm = new Audio(src);
      this.bgm.loop = loop;
      this.bgm.volume = this.config.isBgmMuted ? 0 : this.config.bgmVolume;
      this.bgm.play().catch((e) => console.warn('BGM play failed:', e));
    }
  }

  /**
   * BGMを停止
   */
  stopBgm() {
    if (this.bgm) {
      this.bgm.pause();
      this.bgm.currentTime = 0;
      this.bgm = null;
    }
  }

  /**
   * SEを再生（同時再生可能）
   */
  playSe(src: string, volume?: number) {
    if (!this.initialized) this.init();
    if (this.config.isSeMuted) return;

    if (typeof window === 'undefined') return;

    // プールから未使用のAudioを取得
    let audio: HTMLAudioElement | undefined;
    const pool = this.sePool.get(src);

    if (pool) {
      audio = pool.find(a => a.paused);
    }

    if (!audio) {
      audio = new Audio(src);
      if (!pool) {
        this.sePool.set(src, [audio]);
      } else {
        pool.push(audio);
      }
    }

    audio.volume = volume !== undefined ? volume : this.config.seVolume;
    audio.currentTime = 0;
    audio.play().catch((e) => console.warn('SE play failed:', e));
  }

  /**
   * BGMミュート切替
   */
  toggleBgmMute() {
    this.config.isBgmMuted = !this.config.isBgmMuted;
    if (this.bgm) {
      this.bgm.volume = this.config.isBgmMuted ? 0 : this.config.bgmVolume;
    }
    this.saveConfig();
    return this.config.isBgmMuted;
  }

  /**
   * SEミュート切替
   */
  toggleSeMute() {
    this.config.isSeMuted = !this.config.isSeMuted;
    this.saveConfig();
    return this.config.isSeMuted;
  }

  /**
   * 音量設定
   */
  setVolume(type: SoundType, volume: number) {
    volume = Math.max(0, Math.min(1, volume));

    if (type === 'bgm') {
      this.config.bgmVolume = volume;
      if (this.bgm && !this.config.isBgmMuted) {
        this.bgm.volume = volume;
      }
    } else {
      this.config.seVolume = volume;
    }

    this.saveConfig();
  }

  /**
   * 設定取得
   */
  getConfig() {
    return { ...this.config };
  }

  /**
   * 設定を保存
   */
  private saveConfig() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('audioConfig', JSON.stringify(this.config));
    }
  }
}

export const AudioManager = new AudioManagerClass();

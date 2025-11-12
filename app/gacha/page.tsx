'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GameButton } from '@/components/ui/GameButton';
import { GameCard } from '@/components/ui/GameCard';
import { ParallaxBackground } from '@/components/ui/ParallaxBackground';
import { useSoundEffect } from '@/hooks/useAudio';
import { motion } from 'framer-motion';
import { CardRarity } from '@/types';

interface Banner {
  id: string;
  name: string;
  description: string;
  costGold: number;
  costGems: number;
}

interface GachaResult {
  id: string;
  name: string;
  rarity: string;
  attribute: string;
  imageUrl: string;
}

export default function GachaPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [selectedBanner, setSelectedBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [pulling, setPulling] = useState(false);
  const [results, setResults] = useState<GachaResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const playSe = useSoundEffect();

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const response = await fetch('/api/gacha/banners');
      const data = await response.json();

      if (data.success && data.data.banners.length > 0) {
        setBanners(data.data.banners);
        setSelectedBanner(data.data.banners[0]);
      }
    } catch (error) {
      console.error('Failed to fetch banners:', error);
    } finally {
      setLoading(false);
    }
  };

  const pullGacha = async (pullType: 'single' | 'multi', currency: 'gold' | 'gems') => {
    if (!selectedBanner || pulling) return;

    setPulling(true);
    setResults([]);
    setShowResults(false);

    try {
      const response = await fetch('/api/gacha/pull', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bannerId: selectedBanner.id,
          pullType,
          currencyType: currency,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setResults(data.data.cards);
        setTimeout(() => {
          setShowResults(true);
        }, 500);
      } else {
        alert(data.error?.message || 'ガチャに失敗しました');
      }
    } catch (error) {
      console.error('Gacha pull error:', error);
      alert('ガチャに失敗しました');
    } finally {
      setPulling(false);
    }
  };

  const mapRarity = (rarity: string): CardRarity => {
    switch (rarity) {
      case 'ultra_rare': return 'ultra_rare';
      case 'super_rare': return 'super_rare';
      case 'rare': return 'rare';
      default: return 'common';
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'ultra_rare': return 'from-yellow-400 to-orange-500';
      case 'super_rare': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getAttributeIcon = (attribute: string) => {
    switch (attribute) {
      case 'fire': return '🔥';
      case 'water': return '💧';
      case 'earth': return '🌍';
      case 'wind': return '💨';
      case 'light': return '✨';
      case 'dark': return '🌙';
      default: return '⭐';
    }
  };

  const getRarityName = (rarity: string) => {
    switch (rarity) {
      case 'ultra_rare': return 'UR';
      case 'super_rare': return 'SR';
      case 'rare': return 'R';
      default: return 'C';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p className="mt-4">読み込み中...</p>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <ParallaxBackground layer1Color="from-purple-500 via-pink-500 to-purple-600">
        <div className="min-h-screen p-8">
          <div className="container mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-4xl font-bold text-white mb-4 drop-shadow-lg">✨ ガチャ結果 ✨</h1>
              <p className="text-white text-xl drop-shadow">{results.length}枚のカードを獲得しました！</p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
              {results.map((card, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.3, y: -50 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    delay: index * 0.1,
                    duration: 0.6,
                    type: 'spring',
                    stiffness: 200,
                  }}
                >
                  <GameCard rarity={mapRarity(card.rarity)} hoverable glowEffect>
                    <div className={`h-40 bg-gradient-to-br ${getRarityColor(card.rarity)} flex items-center justify-center relative`}>
                      <div className="text-6xl">{getAttributeIcon(card.attribute)}</div>
                      <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-lg">
                        {getRarityName(card.rarity)}
                      </div>
                    </div>
                    <div className="p-3 bg-white">
                      <h3 className="font-bold text-center truncate">{card.name}</h3>
                    </div>
                  </GameCard>
                </motion.div>
              ))}
            </div>

            <div className="text-center flex gap-4 justify-center">
              <GameButton
                onClick={() => setShowResults(false)}
                variant="secondary"
                size="lg"
              >
                もう一度引く
              </GameButton>
              <Link href="/cards">
                <GameButton variant="success" size="lg">
                  カードを確認
                </GameButton>
              </Link>
            </div>
          </div>
        </div>
      </ParallaxBackground>
    );
  }

  return (
    <ParallaxBackground layer1Color="from-purple-500 via-pink-500 to-purple-600">
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">🎰 ガチャ</h1>
            <Link href="/home">
              <GameButton variant="secondary">
                ← ホームに戻る
              </GameButton>
            </Link>
          </div>

          {/* Banner Selection */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banners.map((banner) => (
                <motion.div
                  key={banner.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedBanner(banner)}
                  className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all ${
                    selectedBanner?.id === banner.id
                      ? 'ring-4 ring-yellow-400 shadow-yellow-400/50'
                      : 'hover:shadow-xl'
                  }`}
                >
                  <h2 className="text-2xl font-bold mb-2">{banner.name}</h2>
                  <p className="text-gray-600 mb-4">{banner.description}</p>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-600 text-xl">💰</span>
                      <span className="font-semibold">{banner.costGold.toLocaleString()} ゴールド</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 text-xl">💎</span>
                      <span className="font-semibold">{banner.costGems.toLocaleString()} ジェム</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Gacha Buttons */}
          {selectedBanner && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/95 backdrop-blur rounded-lg shadow-lg p-8"
            >
              <h2 className="text-2xl font-bold mb-6 text-center">{selectedBanner.name}</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Single Pull with Gold */}
                <div className="border-2 border-yellow-400 rounded-lg p-6 text-center bg-gradient-to-br from-yellow-50 to-orange-50">
                  <h3 className="text-xl font-bold mb-4">単発ガチャ（ゴールド）</h3>
                  <div className="text-3xl mb-4">💰</div>
                  <p className="text-gray-600 mb-4 font-semibold">
                    {selectedBanner.costGold.toLocaleString()} ゴールド
                  </p>
                  <GameButton
                    onClick={() => pullGacha('single', 'gold')}
                    disabled={pulling}
                    variant="warning"
                    className="w-full"
                  >
                    {pulling ? '引いています...' : '1回引く'}
                  </GameButton>
                </div>

                {/* Single Pull with Gems */}
                <div className="border-2 border-blue-400 rounded-lg p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50">
                  <h3 className="text-xl font-bold mb-4">単発ガチャ（ジェム）</h3>
                  <div className="text-3xl mb-4">💎</div>
                  <p className="text-gray-600 mb-4 font-semibold">
                    {selectedBanner.costGems.toLocaleString()} ジェム
                  </p>
                  <GameButton
                    onClick={() => pullGacha('single', 'gems')}
                    disabled={pulling}
                    variant="primary"
                    className="w-full"
                  >
                    {pulling ? '引いています...' : '1回引く'}
                  </GameButton>
                </div>

                {/* 10-Pull with Gold */}
                <div className="border-2 border-yellow-400 rounded-lg p-6 text-center bg-gradient-to-br from-yellow-50 to-orange-50">
                  <h3 className="text-xl font-bold mb-4">10連ガチャ（ゴールド）</h3>
                  <div className="text-3xl mb-2">💰✨</div>
                  <div className="bg-red-100 text-red-600 text-sm font-semibold py-1 px-2 rounded mb-2 inline-block">
                    レア以上1枚確定！
                  </div>
                  <p className="text-gray-600 mb-4 font-semibold">
                    {(selectedBanner.costGold * 10).toLocaleString()} ゴールド
                  </p>
                  <GameButton
                    onClick={() => pullGacha('multi', 'gold')}
                    disabled={pulling}
                    variant="warning"
                    className="w-full"
                  >
                    {pulling ? '引いています...' : '10回引く'}
                  </GameButton>
                </div>

                {/* 10-Pull with Gems */}
                <div className="border-2 border-blue-400 rounded-lg p-6 text-center bg-gradient-to-br from-blue-50 to-cyan-50">
                  <h3 className="text-xl font-bold mb-4">10連ガチャ（ジェム）</h3>
                  <div className="text-3xl mb-2">💎✨</div>
                  <div className="bg-red-100 text-red-600 text-sm font-semibold py-1 px-2 rounded mb-2 inline-block">
                    レア以上1枚確定！
                  </div>
                  <p className="text-gray-600 mb-4 font-semibold">
                    {(selectedBanner.costGems * 10).toLocaleString()} ジェム
                  </p>
                  <GameButton
                    onClick={() => pullGacha('multi', 'gems')}
                    disabled={pulling}
                    variant="primary"
                    className="w-full"
                  >
                    {pulling ? '引いています...' : '10回引く'}
                  </GameButton>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </ParallaxBackground>
  );
}


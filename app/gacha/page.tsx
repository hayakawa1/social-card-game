'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
      <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 p-8">
        <div className="container mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">ガチャ結果</h1>
            <p className="text-white text-xl">{results.length}枚のカードを獲得しました！</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {results.map((card, index) => (
              <div
                key={index}
                className="animate-bounce-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
                  <div className={`h-40 bg-gradient-to-br ${getRarityColor(card.rarity)} flex items-center justify-center relative`}>
                    <div className="text-6xl">{getAttributeIcon(card.attribute)}</div>
                    <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs font-bold">
                      {getRarityName(card.rarity)}
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="font-bold text-center truncate">{card.name}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center space-x-4">
            <button
              onClick={() => setShowResults(false)}
              className="px-8 py-3 bg-white text-purple-600 rounded-lg font-bold hover:bg-gray-100 transition-colors"
            >
              もう一度引く
            </button>
            <Link
              href="/cards"
              className="inline-block px-8 py-3 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
            >
              カードを確認
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-white">ガチャ</h1>
          <Link
            href="/home"
            className="px-4 py-2 bg-white text-purple-600 rounded hover:bg-gray-100 transition-colors font-semibold"
          >
            ← ホームに戻る
          </Link>
        </div>

        {/* Banner Selection */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {banners.map((banner) => (
              <div
                key={banner.id}
                onClick={() => setSelectedBanner(banner)}
                className={`bg-white rounded-lg shadow-lg p-6 cursor-pointer transition-all ${
                  selectedBanner?.id === banner.id
                    ? 'ring-4 ring-yellow-400 transform scale-105'
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
              </div>
            ))}
          </div>
        </div>

        {/* Gacha Buttons */}
        {selectedBanner && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6 text-center">{selectedBanner.name}</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Single Pull with Gold */}
              <div className="border-2 border-yellow-400 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-4">単発ガチャ（ゴールド）</h3>
                <div className="text-3xl mb-4">💰</div>
                <p className="text-gray-600 mb-4">
                  {selectedBanner.costGold.toLocaleString()} ゴールド
                </p>
                <button
                  onClick={() => pullGacha('single', 'gold')}
                  disabled={pulling}
                  className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pulling ? '引いています...' : '1回引く'}
                </button>
              </div>

              {/* Single Pull with Gems */}
              <div className="border-2 border-blue-400 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-4">単発ガチャ（ジェム）</h3>
                <div className="text-3xl mb-4">💎</div>
                <p className="text-gray-600 mb-4">
                  {selectedBanner.costGems.toLocaleString()} ジェム
                </p>
                <button
                  onClick={() => pullGacha('single', 'gems')}
                  disabled={pulling}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pulling ? '引いています...' : '1回引く'}
                </button>
              </div>

              {/* 10-Pull with Gold */}
              <div className="border-2 border-yellow-400 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-4">10連ガチャ（ゴールド）</h3>
                <div className="text-3xl mb-2">💰✨</div>
                <div className="bg-red-100 text-red-600 text-sm font-semibold py-1 px-2 rounded mb-2">
                  レア以上1枚確定！
                </div>
                <p className="text-gray-600 mb-4">
                  {(selectedBanner.costGold * 10).toLocaleString()} ゴールド
                </p>
                <button
                  onClick={() => pullGacha('multi', 'gold')}
                  disabled={pulling}
                  className="w-full bg-yellow-500 text-white py-3 rounded-lg font-bold hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pulling ? '引いています...' : '10回引く'}
                </button>
              </div>

              {/* 10-Pull with Gems */}
              <div className="border-2 border-blue-400 rounded-lg p-6 text-center">
                <h3 className="text-xl font-bold mb-4">10連ガチャ（ジェム）</h3>
                <div className="text-3xl mb-2">💎✨</div>
                <div className="bg-red-100 text-red-600 text-sm font-semibold py-1 px-2 rounded mb-2">
                  レア以上1枚確定！
                </div>
                <p className="text-gray-600 mb-4">
                  {(selectedBanner.costGems * 10).toLocaleString()} ジェム
                </p>
                <button
                  onClick={() => pullGacha('multi', 'gems')}
                  disabled={pulling}
                  className="w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {pulling ? '引いています...' : '10回引く'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-50px);
          }
          50% {
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

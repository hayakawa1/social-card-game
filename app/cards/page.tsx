'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Card {
  id: string;
  name: string;
  rarity: string;
  attribute: string;
  cost: number;
  attack: number;
  defense: number;
  level: number;
  exp: number;
  imageUrl: string;
}

export default function CardsPage() {
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [attributeFilter, setAttributeFilter] = useState<string>('all');

  useEffect(() => {
    fetchCards();
  }, []);

  const fetchCards = async () => {
    try {
      const response = await fetch('/api/cards/collection');
      const data = await response.json();

      if (data.success) {
        setCards(data.data.cards || []);
      }
    } catch (error) {
      console.error('Failed to fetch cards:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCards = cards.filter(card => {
    const rarityMatch = filter === 'all' || card.rarity === filter;
    const attributeMatch = attributeFilter === 'all' || card.attribute === attributeFilter;
    return rarityMatch && attributeMatch;
  });

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'ultra_rare': return 'from-yellow-400 to-orange-500';
      case 'super_rare': return 'from-purple-400 to-pink-500';
      case 'rare': return 'from-blue-400 to-cyan-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  const getAttributeColor = (attribute: string) => {
    switch (attribute) {
      case 'fire': return 'text-red-500';
      case 'water': return 'text-blue-500';
      case 'earth': return 'text-green-500';
      case 'wind': return 'text-cyan-500';
      case 'light': return 'text-yellow-500';
      case 'dark': return 'text-purple-500';
      default: return 'text-gray-500';
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-cyan-400 mx-auto"></div>
          <p className="mt-4 text-cyan-200 text-lg font-semibold">カードを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-cyan-900 to-teal-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" style={{ bottom: '10%', right: '10%' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex justify-between items-center">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl shadow-2xl px-8 py-4 border-4 border-cyan-300">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">💎 カードコレクション</h1>
          </div>
          <Link
            href="/home"
            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all font-bold border-2 border-gray-500 shadow-xl"
          >
            ← ホームに戻る
          </Link>
        </div>

        <div className="mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border-4 border-cyan-300/50">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-bold text-cyan-300 mb-2">
                ⭐ レアリティ
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border-2 border-cyan-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
              >
                <option value="all">すべて</option>
                <option value="common">コモン</option>
                <option value="rare">レア</option>
                <option value="super_rare">スーパーレア</option>
                <option value="ultra_rare">ウルトラレア</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-cyan-300 mb-2">
                🎨 属性
              </label>
              <select
                value={attributeFilter}
                onChange={(e) => setAttributeFilter(e.target.value)}
                className="px-4 py-2 bg-gray-700 border-2 border-cyan-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold"
              >
                <option value="all">すべて</option>
                <option value="fire">🔥 火</option>
                <option value="water">💧 水</option>
                <option value="earth">🌍 土</option>
                <option value="wind">💨 風</option>
                <option value="light">✨ 光</option>
                <option value="dark">🌙 闇</option>
              </select>
            </div>

            <div className="ml-auto self-end">
              <p className="text-cyan-200 text-lg">
                所持カード: <span className="font-bold text-yellow-400 text-xl">{filteredCards.length}</span> / {cards.length}
              </p>
            </div>
          </div>
        </div>

        {filteredCards.length === 0 ? (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-12 text-center border-4 border-gray-700">
            <p className="text-gray-300 text-2xl font-bold mb-6">カードがありません</p>
            <Link
              href="/gacha"
              className="inline-block px-8 py-4 bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white rounded-xl hover:from-purple-400 hover:to-fuchsia-500 transition-all font-bold text-lg shadow-2xl border-4 border-fuchsia-300 animate-pulse"
            >
              🎰 ガチャを引く
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCards.map((card) => (
              <div
                key={card.id}
                className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl overflow-hidden hover:shadow-cyan-500/30 transition-all hover:scale-105 border-4 border-cyan-300/50"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

                <div className={`h-48 bg-gradient-to-br ${getRarityColor(card.rarity)} flex items-center justify-center border-b-4 border-gray-800`}>
                  <div className="text-7xl drop-shadow-2xl transform group-hover:scale-110 transition-transform">{getAttributeIcon(card.attribute)}</div>
                </div>

                <div className="p-4 relative z-10">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-lg text-white truncate drop-shadow-lg">{card.name}</h3>
                    <span className={`text-2xl ${getAttributeColor(card.attribute)} drop-shadow-lg`}>
                      {getAttributeIcon(card.attribute)}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between bg-black/20 px-3 py-1 rounded-lg">
                      <span className="text-cyan-300 font-semibold">レベル:</span>
                      <span className="font-bold text-white">{card.level}</span>
                    </div>
                    <div className="flex justify-between bg-black/20 px-3 py-1 rounded-lg">
                      <span className="text-purple-300 font-semibold">コスト:</span>
                      <span className="font-bold text-white">{card.cost}</span>
                    </div>
                    <div className="flex justify-between bg-red-500/20 px-3 py-1 rounded-lg border border-red-400/30">
                      <span className="text-red-300 font-semibold">⚔️ 攻撃力:</span>
                      <span className="font-bold text-red-200">{card.attack}</span>
                    </div>
                    <div className="flex justify-between bg-blue-500/20 px-3 py-1 rounded-lg border border-blue-400/30">
                      <span className="text-blue-300 font-semibold">🛡️ 防御力:</span>
                      <span className="font-bold text-blue-200">{card.defense}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-gray-700">
                    <div className="text-xs text-cyan-300 mb-2 font-semibold">経験値</div>
                    <div className="w-full bg-gray-700 rounded-full h-3 border-2 border-gray-600">
                      <div
                        className="bg-gradient-to-r from-green-400 to-emerald-500 h-full rounded-full transition-all shadow-lg"
                        style={{ width: `${(card.exp % 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

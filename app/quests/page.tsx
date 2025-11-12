'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Quest {
  id: string;
  name: string;
  description: string;
  difficulty: string;
  staminaCost: number;
  requiredLevel: number;
  rewards: any[];
  firstClearRewards: any[];
  cleared: boolean;
}

export default function QuestsPage() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await fetch('/api/quests');
      const data = await response.json();

      if (data.success) {
        setQuests(data.data.quests || []);
      }
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-500';
      case 'normal': return 'bg-blue-500';
      case 'hard': return 'bg-orange-500';
      case 'expert': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return '初級';
      case 'normal': return '中級';
      case 'hard': return '上級';
      case 'expert': return '超級';
      default: return difficulty;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">クエストを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-purple-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-red-500/10 rounded-full blur-3xl" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" style={{ bottom: '10%', right: '10%' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex justify-between items-center">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl shadow-2xl px-8 py-4 border-4 border-orange-300">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">⚔️ クエスト</h1>
          </div>
          <Link
            href="/home"
            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all font-bold border-2 border-gray-500 shadow-xl"
          >
            ← ホームに戻る
          </Link>
        </div>

        <div className="space-y-6">
          {quests.map((quest) => (
            <div
              key={quest.id}
              className="group relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 hover:shadow-red-500/30 transition-all hover:scale-[1.02] border-4 border-red-300/50"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3 flex-wrap">
                    <h2 className="text-3xl font-bold text-white drop-shadow-lg">{quest.name}</h2>
                    <span className={`px-4 py-2 rounded-xl text-white text-sm font-bold shadow-lg ${getDifficultyColor(quest.difficulty)}`}>
                      {getDifficultyName(quest.difficulty)}
                    </span>
                    {quest.cleared && (
                      <span className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm font-bold shadow-lg animate-pulse">
                        ✓ クリア済み
                      </span>
                    )}
                  </div>
                  <p className="text-gray-300 mb-4 text-lg">{quest.description}</p>

                  <div className="flex gap-6 text-sm">
                    <div className="flex items-center gap-2 bg-blue-500/20 px-4 py-2 rounded-xl border-2 border-blue-400">
                      <span className="text-blue-300 font-semibold">スタミナ:</span>
                      <span className="font-bold text-white">⚡ {quest.staminaCost}</span>
                    </div>
                    <div className="flex items-center gap-2 bg-purple-500/20 px-4 py-2 rounded-xl border-2 border-purple-400">
                      <span className="text-purple-300 font-semibold">推奨レベル:</span>
                      <span className="font-bold text-white">Lv.{quest.requiredLevel}</span>
                    </div>
                  </div>
                </div>

                <button
                  className={`px-8 py-4 rounded-xl font-bold transition-all shadow-2xl text-lg ${
                    quest.cleared
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-400 hover:to-cyan-500 text-white border-4 border-cyan-300'
                      : 'bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-400 hover:to-orange-500 text-white border-4 border-orange-300 animate-pulse'
                  }`}
                  onClick={() => alert('バトルシステムは未実装です')}
                >
                  {quest.cleared ? '🔄 再挑戦' : '⚔️ 挑戦する'}
                </button>
              </div>

              <div className="border-t-2 border-gray-700 pt-4 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-4 rounded-xl border-2 border-yellow-400/30">
                    <h3 className="font-bold mb-3 text-yellow-300 text-lg flex items-center gap-2">
                      <span>💰</span> 通常報酬
                    </h3>
                    <div className="space-y-2">
                      {quest.rewards.map((reward: any, index: number) => (
                        <div key={index} className="text-white font-semibold bg-black/30 px-3 py-2 rounded-lg">
                          {reward.type === 'gold' ? '💰' : reward.type === 'exp' ? '⭐' : '🎁'} {reward.amount.toLocaleString()} {reward.type === 'gold' ? 'ゴールド' : reward.type === 'exp' ? '経験値' : ''}
                        </div>
                      ))}
                    </div>
                  </div>

                  {!quest.cleared && (
                    <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-4 rounded-xl border-2 border-pink-400 animate-pulse">
                      <h3 className="font-bold mb-3 text-pink-300 text-lg flex items-center gap-2">
                        <span>🌟</span> 初回クリア報酬
                      </h3>
                      <div className="space-y-2">
                        {quest.firstClearRewards.map((reward: any, index: number) => (
                          <div key={index} className="text-white font-semibold bg-black/30 px-3 py-2 rounded-lg">
                            {reward.type === 'gold' ? '💰' : reward.type === 'gems' ? '💎' : '🎁'} {reward.amount.toLocaleString()} {reward.type === 'gold' ? 'ゴールド' : reward.type === 'gems' ? 'ジェム' : ''}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {quests.length === 0 && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-12 text-center border-4 border-gray-700">
            <p className="text-gray-300 text-2xl font-bold">利用可能なクエストがありません</p>
          </div>
        )}
      </div>
    </div>
  );
}

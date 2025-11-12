'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type RankingType = 'level' | 'power' | 'wins' | 'winRate';

interface RankingEntry {
  rank: number;
  playerId: string;
  username: string;
  level: number;
  totalPower: number;
  wins: number;
  losses: number;
  winRate: number;
  value: number;
}

interface PlayerRanks {
  level: { rank: number; total: number } | null;
  power: { rank: number; total: number } | null;
  wins: { rank: number; total: number } | null;
  winRate: { rank: number; total: number } | null;
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingEntry[]>([]);
  const [myRanks, setMyRanks] = useState<PlayerRanks | null>(null);
  const [loading, setLoading] = useState(true);
  const [rankingType, setRankingType] = useState<RankingType>('level');

  useEffect(() => {
    fetchData();
  }, [rankingType]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchRankings(), fetchMyRanks()]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRankings = async () => {
    try {
      const response = await fetch(`/api/ranking?type=${rankingType}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setRankings(data.data.rankings || []);
      }
    } catch (error) {
      console.error('Failed to fetch rankings:', error);
    }
  };

  const fetchMyRanks = async () => {
    try {
      const response = await fetch('/api/ranking/my-rank');
      const data = await response.json();

      if (data.success) {
        setMyRanks(data.data.ranks || null);
      }
    } catch (error) {
      console.error('Failed to fetch my ranks:', error);
    }
  };

  const getRankingTypeLabel = (type: RankingType): string => {
    switch (type) {
      case 'level':
        return 'レベル';
      case 'power':
        return '総戦闘力';
      case 'wins':
        return '勝利数';
      case 'winRate':
        return '勝率';
      default:
        return '';
    }
  };

  const getValueDisplay = (entry: RankingEntry): string => {
    if (rankingType === 'winRate') {
      return `${entry.winRate.toFixed(1)}%`;
    }
    return entry.value.toString();
  };

  const getMedalEmoji = (rank: number): string => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return '';
    }
  };

  const getRankColor = (rank: number): string => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 border-yellow-300';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-400 border-gray-300';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-red-500 border-orange-300';
      default:
        return 'bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-yellow-400 mx-auto shadow-2xl"></div>
          <p className="mt-6 text-yellow-100 text-2xl font-bold animate-pulse">ランキングを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-orange-900 to-red-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" style={{ top: '10%', left: '20%' }}></div>
        <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" style={{ bottom: '20%', right: '20%' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex justify-between items-center">
          <div className="bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-2xl shadow-2xl px-8 py-4 border-4 border-yellow-300 animate-pulse">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">🏆 ランキング</h1>
          </div>
          <Link
            href="/home"
            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all font-bold border-2 border-gray-500 shadow-xl"
          >
            ← ホームに戻る
          </Link>
        </div>

        {/* My Ranks Card */}
        {myRanks && (
          <div className="mb-8 bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 rounded-2xl shadow-2xl p-6 text-white border-4 border-pink-300">
            <h2 className="text-3xl font-bold mb-6 drop-shadow-lg flex items-center gap-2">
              <span>👤</span> あなたの順位
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/20 backdrop-blur rounded-xl p-5 text-center border-2 border-white/50 hover:scale-105 transition-transform">
                <div className="text-sm mb-2 font-semibold text-pink-100">レベル</div>
                <div className="text-3xl font-bold drop-shadow-lg">
                  {myRanks.level ? `${myRanks.level.rank}位` : '-'}
                </div>
                {myRanks.level && (
                  <div className="text-xs mt-2 text-pink-200">/ {myRanks.level.total}人</div>
                )}
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-5 text-center border-2 border-white/50 hover:scale-105 transition-transform">
                <div className="text-sm mb-2 font-semibold text-pink-100">総戦闘力</div>
                <div className="text-3xl font-bold drop-shadow-lg">
                  {myRanks.power ? `${myRanks.power.rank}位` : '-'}
                </div>
                {myRanks.power && (
                  <div className="text-xs mt-2 text-pink-200">/ {myRanks.power.total}人</div>
                )}
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-5 text-center border-2 border-white/50 hover:scale-105 transition-transform">
                <div className="text-sm mb-2 font-semibold text-pink-100">勝利数</div>
                <div className="text-3xl font-bold drop-shadow-lg">
                  {myRanks.wins ? `${myRanks.wins.rank}位` : '-'}
                </div>
                {myRanks.wins && (
                  <div className="text-xs mt-2 text-pink-200">/ {myRanks.wins.total}人</div>
                )}
              </div>
              <div className="bg-white/20 backdrop-blur rounded-xl p-5 text-center border-2 border-white/50 hover:scale-105 transition-transform">
                <div className="text-sm mb-2 font-semibold text-pink-100">勝率</div>
                <div className="text-3xl font-bold drop-shadow-lg">
                  {myRanks.winRate ? `${myRanks.winRate.rank}位` : '-'}
                </div>
                {myRanks.winRate && (
                  <div className="text-xs mt-2 text-pink-200">/ {myRanks.winRate.total}人</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Ranking Type Selector */}
        <div className="mb-8 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-2xl p-6 border-4 border-blue-300">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setRankingType('level')}
              className={`py-4 px-6 rounded-xl font-bold transition-all shadow-lg ${
                rankingType === 'level'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white scale-110 border-4 border-white'
                  : 'bg-white/20 backdrop-blur text-white hover:bg-white/30 border-2 border-white/50'
              }`}
            >
              ⭐ レベル
            </button>
            <button
              onClick={() => setRankingType('power')}
              className={`py-4 px-6 rounded-xl font-bold transition-all shadow-lg ${
                rankingType === 'power'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white scale-110 border-4 border-white'
                  : 'bg-white/20 backdrop-blur text-white hover:bg-white/30 border-2 border-white/50'
              }`}
            >
              💪 総戦闘力
            </button>
            <button
              onClick={() => setRankingType('wins')}
              className={`py-4 px-6 rounded-xl font-bold transition-all shadow-lg ${
                rankingType === 'wins'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white scale-110 border-4 border-white'
                  : 'bg-white/20 backdrop-blur text-white hover:bg-white/30 border-2 border-white/50'
              }`}
            >
              ⚔️ 勝利数
            </button>
            <button
              onClick={() => setRankingType('winRate')}
              className={`py-4 px-6 rounded-xl font-bold transition-all shadow-lg ${
                rankingType === 'winRate'
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white scale-110 border-4 border-white'
                  : 'bg-white/20 backdrop-blur text-white hover:bg-white/30 border-2 border-white/50'
              }`}
            >
              📊 勝率
            </button>
          </div>
        </div>

        {/* Rankings List */}
        <div className="space-y-4">
          {rankings.map((entry) => (
            <div
              key={entry.playerId}
              className={`border-4 rounded-2xl shadow-2xl p-6 flex items-center justify-between hover:scale-[1.02] transition-transform ${getRankColor(
                entry.rank
              )}`}
            >
              <div className="flex items-center gap-6 flex-1">
                <div className="text-center min-w-[80px]">
                  <div className="text-5xl font-bold drop-shadow-lg">
                    {getMedalEmoji(entry.rank) || entry.rank}
                  </div>
                  {!getMedalEmoji(entry.rank) && (
                    <div className="text-sm text-white font-bold mt-1">位</div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">{entry.username}</h3>
                  <div className="flex gap-4 text-sm">
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-white font-semibold border border-white/50">Lv.{entry.level}</span>
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-white font-semibold border border-white/50">戦闘力: {entry.totalPower.toLocaleString()}</span>
                    <span className="bg-white/20 backdrop-blur px-3 py-1 rounded-lg text-white font-semibold border border-white/50">
                      {entry.wins}勝 {entry.losses}敗
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right bg-white/20 backdrop-blur rounded-xl p-4 border-2 border-white/50">
                <div className="text-sm text-white font-semibold mb-2">
                  {getRankingTypeLabel(rankingType)}
                </div>
                <div className="text-4xl font-bold text-white drop-shadow-lg">
                  {getValueDisplay(entry)}
                </div>
              </div>
            </div>
          ))}

          {rankings.length === 0 && (
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-12 text-center border-4 border-gray-700">
              <p className="text-white text-2xl font-bold">ランキングデータがありません</p>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl shadow-2xl p-6 border-4 border-purple-300">
          <h3 className="font-bold text-white text-2xl mb-4 drop-shadow-lg flex items-center gap-2">
            <span>ℹ️</span> ランキングについて
          </h3>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4">
            <ul className="space-y-3 text-white font-semibold">
              <li className="flex items-start gap-2">
                <span className="text-yellow-300">🔄</span>
                <span>ランキングは1時間ごとに更新されます</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-300">⭐</span>
                <span>レベルランキング: プレイヤーレベルの高い順</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-pink-300">💪</span>
                <span>総戦闘力ランキング: 全カードの戦闘力合計が高い順</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-300">⚔️</span>
                <span>勝利数ランキング: バトルでの勝利数が多い順</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-300">📊</span>
                <span>勝率ランキング: バトルでの勝率が高い順</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

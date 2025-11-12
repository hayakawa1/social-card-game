"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Star, Heart } from 'lucide-react';

interface Session {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  };
}

export function HomePageClient({ session }: { session: Session }) {
  const menuItems = [
    {
      href: '/muscle-prism',
      title: 'MUSCLE☆PRISM',
      description: '筋闘女プロダクション',
      emoji: '💪',
      gradient: 'from-pink-400 via-purple-400 to-cyan-400',
      borderColor: 'border-pink-300',
      shadowColor: 'hover:shadow-pink-500/50',
      isSpecial: true,
    },
    {
      href: '/cards',
      title: 'カードコレクション',
      description: 'あなたのカードを管理',
      emoji: '💎',
      gradient: 'from-pink-500 to-rose-500',
      borderColor: 'border-pink-300',
      shadowColor: 'hover:shadow-pink-500/50',
    },
    {
      href: '/decks',
      title: 'デッキ編成',
      description: '最強のデッキを作ろう',
      emoji: '🎴',
      gradient: 'from-purple-500 to-fuchsia-500',
      borderColor: 'border-purple-300',
      shadowColor: 'hover:shadow-purple-500/50',
    },
    {
      href: '/gacha',
      title: 'ガチャ',
      description: '新しいカードを入手',
      emoji: '✨',
      gradient: 'from-yellow-400 to-pink-500',
      borderColor: 'border-yellow-300',
      shadowColor: 'hover:shadow-yellow-500/50',
    },
    {
      href: '/quests',
      title: 'クエスト',
      description: '冒険に出発しよう',
      emoji: '⚔️',
      gradient: 'from-cyan-500 to-blue-500',
      borderColor: 'border-cyan-300',
      shadowColor: 'hover:shadow-cyan-500/50',
    },
    {
      href: '/friends',
      title: 'フレンド',
      description: '友達と協力しよう',
      emoji: '👥',
      gradient: 'from-orange-500 to-red-500',
      borderColor: 'border-orange-300',
      shadowColor: 'hover:shadow-orange-500/50',
    },
    {
      href: '/ranking',
      title: 'ランキング',
      description: 'トップを目指せ！',
      emoji: '🏆',
      gradient: 'from-amber-500 to-yellow-500',
      borderColor: 'border-amber-300',
      shadowColor: 'hover:shadow-amber-500/50',
    },
  ];

  return (
    <div className="min-h-screen text-white relative">
      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl shadow-2xl p-8 mb-8 border-2 border-white/30 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
          <div className="relative z-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Star className="h-8 w-8 text-yellow-300 fill-yellow-300 animate-pulse" />
              <motion.h1
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-4xl font-black text-white drop-shadow-lg text-center"
              >
                ようこそ、{session.user?.name || 'プレイヤー'}さん！
              </motion.h1>
              <Star className="h-8 w-8 text-yellow-300 fill-yellow-300 animate-pulse" />
            </div>
            <p className="text-white text-lg font-bold drop-shadow text-center flex items-center justify-center gap-2">
              <Heart className="h-5 w-5 fill-pink-300 text-pink-300" />
              MUSCLE☆PRISM で冒険を始めよう！
              <Heart className="h-5 w-5 fill-pink-300 text-pink-300" />
            </p>
          </div>
        </motion.div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.href}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
            >
              <Link
                href={item.href}
                className={`group relative bg-gradient-to-br ${item.gradient} rounded-2xl shadow-2xl p-6 ${item.shadowColor} transition-all border-4 ${item.borderColor} block h-full ${
                  item.isSpecial ? 'animate-pulse' : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl" />
                <motion.div
                  animate={{
                    rotate: item.isSpecial ? [0, 10, -10, 0] : [0, 5, -5, 0],
                    scale: item.isSpecial ? [1, 1.1, 1] : [1, 1.05, 1],
                  }}
                  transition={{
                    duration: item.isSpecial ? 2 : 3,
                    repeat: Infinity,
                  }}
                  className="text-6xl mb-3 text-center drop-shadow-lg"
                >
                  {item.emoji}
                </motion.div>
                <h2 className="text-2xl font-black mb-2 text-white drop-shadow-lg text-center">
                  {item.title}
                </h2>
                <p className="text-white/90 mb-4 font-bold text-center text-sm">
                  {item.description}
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-white/30 backdrop-blur text-white py-3 rounded-xl hover:bg-white/40 transition-colors text-center font-black border-2 border-white/60 shadow-lg"
                >
                  {item.title} →
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Player Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border-2 border-pink-400/30"
        >
          <div className="flex items-center gap-3 mb-4">
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
            <h3 className="text-2xl font-black text-white drop-shadow-lg">
              プレイヤー情報
            </h3>
            <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
          </div>
          <div className="bg-black/30 backdrop-blur rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="font-black text-pink-300 text-sm">🆔 ID:</span>
              <span className="text-white font-mono text-sm">
                {session.user?.id}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black text-purple-300 text-sm">👤 名前:</span>
              <span className="text-white font-bold">{session.user?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-black text-cyan-300 text-sm">📧 メール:</span>
              <span className="text-white">{session.user?.email}</span>
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center text-xs text-pink-300 pt-8 font-semibold"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            ✨ Powered by MUSCLE☆PRISM ✨
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

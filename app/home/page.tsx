import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function HomePage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-2 h-2 bg-white rounded-full animate-pulse" style={{ top: '10%', left: '20%', animationDelay: '0s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '30%', left: '80%', animationDelay: '1s' }}></div>
        <div className="absolute w-2 h-2 bg-white rounded-full animate-pulse" style={{ top: '60%', left: '10%', animationDelay: '2s' }}></div>
        <div className="absolute w-1 h-1 bg-white rounded-full animate-pulse" style={{ top: '80%', left: '70%', animationDelay: '1.5s' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-yellow-400 via-red-500 to-pink-500 rounded-2xl shadow-2xl p-8 mb-8 transform hover:scale-105 transition-transform">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg animate-pulse">
            ⚡ ようこそ、{session.user?.name || 'プレイヤー'}さん！⚡
          </h1>
          <p className="text-white text-lg font-semibold drop-shadow">Social Card Game で冒険を始めよう！</p>
        </div>

        {/* Menu Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card Collection */}
          <Link href="/cards" className="group relative bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-2xl p-6 hover:shadow-cyan-500/50 transition-all hover:scale-105 border-4 border-cyan-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
            <div className="text-6xl mb-3 animate-bounce">💎</div>
            <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">カードコレクション</h2>
            <p className="text-cyan-100 mb-4 font-semibold">あなたのカードを管理</p>
            <div className="w-full bg-white/20 backdrop-blur text-white py-3 rounded-xl hover:bg-white/30 transition-colors text-center font-bold border-2 border-white/50">
              コレクションを見る →
            </div>
          </Link>

          {/* Deck Building */}
          <Link href="/decks" className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-2xl p-6 hover:shadow-emerald-500/50 transition-all hover:scale-105 border-4 border-emerald-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
            <div className="text-6xl mb-3 animate-bounce">🎴</div>
            <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">デッキ編成</h2>
            <p className="text-emerald-100 mb-4 font-semibold">最強のデッキを作ろう</p>
            <div className="w-full bg-white/20 backdrop-blur text-white py-3 rounded-xl hover:bg-white/30 transition-colors text-center font-bold border-2 border-white/50">
              デッキを編成 →
            </div>
          </Link>

          {/* Gacha */}
          <Link href="/gacha" className="group relative bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-2xl shadow-2xl p-6 hover:shadow-fuchsia-500/50 transition-all hover:scale-105 border-4 border-fuchsia-300 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
            <div className="text-6xl mb-3 animate-spin" style={{ animationDuration: '3s' }}>🎰</div>
            <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">ガチャ</h2>
            <p className="text-fuchsia-100 mb-4 font-semibold">新しいカードを入手</p>
            <div className="w-full bg-white/20 backdrop-blur text-white py-3 rounded-xl hover:bg-white/30 transition-colors text-center font-bold border-2 border-white/50">
              ガチャを引く →
            </div>
          </Link>

          {/* Quests */}
          <Link href="/quests" className="group relative bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-2xl p-6 hover:shadow-rose-500/50 transition-all hover:scale-105 border-4 border-rose-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
            <div className="text-6xl mb-3 animate-bounce">⚔️</div>
            <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">クエスト</h2>
            <p className="text-rose-100 mb-4 font-semibold">冒険に出発しよう</p>
            <div className="w-full bg-white/20 backdrop-blur text-white py-3 rounded-xl hover:bg-white/30 transition-colors text-center font-bold border-2 border-white/50">
              クエスト開始 →
            </div>
          </Link>

          {/* Friends */}
          <Link href="/friends" className="group relative bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl shadow-2xl p-6 hover:shadow-orange-500/50 transition-all hover:scale-105 border-4 border-orange-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
            <div className="text-6xl mb-3 animate-bounce">👥</div>
            <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">フレンド</h2>
            <p className="text-orange-100 mb-4 font-semibold">友達と協力しよう</p>
            <div className="w-full bg-white/20 backdrop-blur text-white py-3 rounded-xl hover:bg-white/30 transition-colors text-center font-bold border-2 border-white/50">
              フレンド一覧 →
            </div>
          </Link>

          {/* Ranking */}
          <Link href="/ranking" className="group relative bg-gradient-to-br from-amber-500 to-yellow-600 rounded-2xl shadow-2xl p-6 hover:shadow-yellow-500/50 transition-all hover:scale-105 border-4 border-yellow-300">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-2xl"></div>
            <div className="text-6xl mb-3 animate-bounce">🏆</div>
            <h2 className="text-2xl font-bold mb-2 text-white drop-shadow-lg">ランキング</h2>
            <p className="text-yellow-100 mb-4 font-semibold">トップを目指せ！</p>
            <div className="w-full bg-white/20 backdrop-blur text-white py-3 rounded-xl hover:bg-white/30 transition-colors text-center font-bold border-2 border-white/50">
              ランキングを見る →
            </div>
          </Link>
        </div>

        {/* Player Info Card */}
        <div className="mt-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-2xl p-6 border-4 border-purple-300">
          <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">📊 プレイヤー情報</h3>
          <div className="bg-white/10 backdrop-blur rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-200">🆔 ID:</span>
              <span className="text-white font-mono text-sm">{session.user?.id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-200">👤 名前:</span>
              <span className="text-white font-semibold">{session.user?.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-purple-200">📧 メール:</span>
              <span className="text-white">{session.user?.email}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

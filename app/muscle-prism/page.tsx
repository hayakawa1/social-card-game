"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sparkles, Dumbbell, Swords, Users, ShoppingBag, Loader2, Heart, Star, Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  usePlayerProfile,
  useCardsCollection,
  performGachaPull,
} from "@/hooks/useMusclePrism";
import { useMusclePrismStore } from "@/stores/musclePrismStore";

// Tab content components
function HomeScreen() {
  const { cards, isLoading } = useCardsCollection();
  const selectedCharacter = useMusclePrismStore((state) => state.selectedCharacter);
  const setSelectedCharacter = useMusclePrismStore(
    (state) => state.setSelectedCharacter
  );

  // Take first 3 cards as characters or use placeholders
  const characters = cards.slice(0, 3).map((card: any, index: number) => ({
    id: card.id,
    name: card.cardMaster?.name || ["アイリ", "ミカ", "レイナ"][index],
    type: ["Idol-Fighter", "Brawler", "Diva"][index],
    emoji: ["💕", "🔥", "💎"][index],
    color: ["from-pink-400 to-rose-400", "from-orange-400 to-red-400", "from-cyan-400 to-blue-400"][index],
    level: card.level,
    exp: card.exp,
    attack: card.attack,
    defense: card.defense,
  }));

  // Fill with placeholders if not enough cards
  while (characters.length < 3) {
    const index = characters.length;
    characters.push({
      id: `placeholder-${index}`,
      name: ["アイリ", "ミカ", "レイナ"][index],
      type: ["Idol-Fighter", "Brawler", "Diva"][index],
      emoji: ["💕", "🔥", "💎"][index],
      color: ["from-pink-400 to-rose-400", "from-orange-400 to-red-400", "from-cyan-400 to-blue-400"][index],
      level: 1,
      exp: 0,
      attack: 0,
      defense: 0,
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <Loader2 className="h-8 w-8 animate-spin text-pink-400" />
          <Sparkles className="h-4 w-4 absolute -top-2 -right-2 text-yellow-400 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 animate-pulse" />
          <h2 className="text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            PRISM本社ジム
          </h2>
          <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 animate-pulse" />
        </div>
        <p className="text-sm text-pink-300 mt-2 flex items-center justify-center gap-2">
          <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
          今日は誰をトレーニングする？
          <Heart className="h-4 w-4 fill-pink-400 text-pink-400" />
        </p>
      </motion.div>

      {/* Character Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {characters.map((character, index) => (
          <motion.div
            key={character.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
            onClick={() => setSelectedCharacter(character)}
            className={`relative bg-gradient-to-br ${character.color} p-[3px] rounded-2xl cursor-pointer transition-all shadow-2xl hover:shadow-pink-500/50 ${
              selectedCharacter?.id === character.id
                ? "ring-4 ring-yellow-400 ring-offset-4 ring-offset-zinc-900 shadow-yellow-400/50"
                : ""
            }`}
          >
            {/* Holographic shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-2xl animate-shimmer opacity-0 hover:opacity-100 transition-opacity" />
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 relative overflow-hidden">
              {selectedCharacter?.id === character.id && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-3 -right-3 bg-yellow-400 text-zinc-900 rounded-full p-2"
                >
                  <Star className="h-5 w-5 fill-current" />
                </motion.div>
              )}
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-6xl mb-4 text-center drop-shadow-2xl"
              >
                {character.emoji}
              </motion.div>
              <h3 className="text-2xl font-black text-center bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent mb-1 drop-shadow">
                {character.name}
              </h3>
              <p className="text-sm text-center text-purple-600 mb-3 font-bold">{character.type}</p>
              <div className="space-y-2 text-sm text-center bg-gradient-to-br from-pink-100/50 to-purple-100/50 rounded-lg p-3 backdrop-blur border border-pink-300/30">
                <div className="flex items-center justify-center gap-2">
                  <Sparkles className="h-3 w-3 text-yellow-500" />
                  <span className="text-yellow-600 font-bold">Lv.{character.level}</span>
                </div>
                {character.attack > 0 && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-pink-600">💪 ATK:</span>
                      <span className="text-pink-700 font-bold">{character.attack}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-600">🛡️ DEF:</span>
                      <span className="text-cyan-700 font-bold">{character.defense}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function TrainingScreen() {
  const selectedCharacter = useMusclePrismStore((state) => state.selectedCharacter);
  const { player } = usePlayerProfile();

  const trainingOptions = [
    { name: "筋トレ", icon: "🏋️", stat: "ATK", color: "from-pink-500 to-rose-500" },
    { name: "ポージング", icon: "✨", stat: "CHR", color: "from-cyan-500 to-blue-500" },
    { name: "メディテーション", icon: "🧘‍♀️", stat: "DEF", color: "from-purple-500 to-pink-500" },
    { name: "ライブレッスン", icon: "🎤", stat: "FAN", color: "from-yellow-500 to-orange-500" },
  ];

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-3xl font-black text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
      >
        💪 TRAINING STUDIO ✨
      </motion.h2>
      <div className="bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-cyan-500/10 border-2 border-pink-400/30 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-black/30 rounded-full px-6 py-3">
            <span className="flex items-center gap-2 font-bold">
              <Zap className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              スタミナ
            </span>
            <span className="text-cyan-400 font-black text-lg">
              {player?.stamina || 0}/{player?.maxStamina || 100}
            </span>
          </div>

          <AnimatePresence mode="wait">
            {selectedCharacter ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="text-center mb-6 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl p-4">
                  <div className="text-4xl mb-2">{selectedCharacter.emoji}</div>
                  <p className="text-lg font-bold text-pink-300">
                    {selectedCharacter.name} をトレーニング中
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {trainingOptions.map((option, index) => (
                    <motion.button
                      key={option.name}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, rotate: [0, -2, 2, 0] }}
                      whileTap={{ scale: 0.95 }}
                      className={`bg-gradient-to-br ${option.color} hover:opacity-90 rounded-xl py-4 px-4 transition-all shadow-lg hover:shadow-xl font-bold text-white`}
                    >
                      <div className="text-3xl mb-2">{option.icon}</div>
                      <div className="text-sm">{option.name}</div>
                      <div className="text-xs opacity-80 mt-1">{option.stat}+</div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-pink-300"
              >
                <Heart className="h-12 w-12 mx-auto mb-4 text-pink-400" />
                Homeタブでキャラクターを選択してください
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function ColosseumScreen() {
  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-3xl font-black text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
      >
        ⚔️ BATTLE STAGE 🎤
      </motion.h2>

      {/* Arena/Live Stage Background */}
      <div className="bg-gradient-to-br from-pink-900/30 to-purple-900/30 border-2 border-pink-400/30 rounded-2xl p-8 backdrop-blur-sm shadow-xl relative overflow-hidden">
        {/* Spotlight effects */}
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-yellow-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-0 right-1/4 w-32 h-32 bg-cyan-400/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

        <div className="text-center space-y-6 relative z-10">
          {/* Audience and Trend Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 border border-pink-400/30 rounded-xl p-4 backdrop-blur"
            >
              <div className="text-3xl mb-2">👥</div>
              <div className="text-sm text-pink-300 font-bold">観客数</div>
              <div className="text-2xl font-black text-pink-200">25,000</div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-400/30 rounded-xl p-4 backdrop-blur"
            >
              <div className="text-3xl mb-2">🔥</div>
              <div className="text-sm text-purple-300 font-bold">熱気レベル</div>
              <div className="text-2xl font-black text-purple-200">MAX!</div>
            </motion.div>

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              className="bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-xl p-4 backdrop-blur"
            >
              <div className="text-3xl mb-2">⭐</div>
              <div className="text-sm text-cyan-300 font-bold">トレンド</div>
              <div className="text-lg font-black text-cyan-200">#筋肉アイドル</div>
            </motion.div>
          </div>

          {/* Audience Reactions */}
          <div className="flex justify-center gap-2 flex-wrap mb-6">
            {["ENCORE!", "💪", "CUTE!", "💕", "STRONG!", "✨"].map((cheer, i) => (
              <motion.span
                key={i}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="px-3 py-1 bg-gradient-to-r from-pink-400/30 to-purple-400/30 border border-pink-300/50 rounded-full text-sm font-bold text-pink-200 backdrop-blur"
              >
                {cheer}
              </motion.span>
            ))}
          </div>

          {/* Start Button */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ["0 0 20px rgba(236, 72, 153, 0.5)", "0 0 40px rgba(236, 72, 153, 0.8)", "0 0 20px rgba(236, 72, 153, 0.5)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 hover:from-pink-600 hover:via-purple-600 hover:to-cyan-600 text-white font-black py-4 px-12 rounded-full transition-all shadow-2xl text-lg relative overflow-hidden"
          >
            <span className="relative z-10">✨ LIVE開始 ✨</span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
          </motion.button>

          <p className="text-xs text-pink-400 mt-4">
            ※バトルシステムは開発中です
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoutScreen() {
  const [isScounting, setIsScounting] = useState(false);
  const { player, mutate: mutatePlayer } = usePlayerProfile();
  const { mutate: mutateCards } = useCardsCollection();

  const handleScout = async () => {
    if (!player) return;

    try {
      setIsScounting(true);
      const result = await performGachaPull("default-banner", "single", "gold");
      await mutatePlayer();
      await mutateCards();
      alert(`✨ スカウト成功！新メンバーが加わりました！💕`);
    } catch (error: any) {
      alert(`❌ スカウト失敗: ${error.message}`);
    } finally {
      setIsScounting(false);
    }
  };

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-3xl font-black text-center bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent"
      >
        🎟️ SCOUT ✨
      </motion.h2>
      <div className="bg-gradient-to-br from-yellow-900/20 to-pink-900/20 border-2 border-yellow-400/30 rounded-2xl p-8 backdrop-blur-sm text-center shadow-xl relative overflow-hidden">
        {/* Spotlight rotating effect */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 pointer-events-none"
        >
          <div className="absolute top-0 left-1/2 w-48 h-48 bg-yellow-400/10 rounded-full blur-3xl -translate-x-1/2" />
        </motion.div>

        <div className="space-y-6 relative z-10">
          <div className="flex justify-center gap-4 mb-6">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border-2 border-yellow-400/50 font-bold backdrop-blur"
            >
              💰 Gold: {player?.gold?.toLocaleString() || 0}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border-2 border-cyan-400/50 font-bold backdrop-blur"
            >
              💎 Gems: {player?.gems?.toLocaleString() || 0}
            </motion.span>
          </div>

          {/* Sparkling stars around the main icon */}
          <div className="relative inline-block">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-8xl mb-4"
            >
              ✨
            </motion.div>
            {[0, 72, 144, 216, 288].map((angle, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.2 }}
                className="absolute text-2xl"
                style={{
                  left: `${50 + 40 * Math.cos((angle * Math.PI) / 180)}%`,
                  top: `${50 + 40 * Math.sin((angle * Math.PI) / 180)}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                ⭐
              </motion.div>
            ))}
          </div>

          <motion.p
            animate={{ opacity: [1, 0.7, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-pink-300 text-lg font-bold"
          >
            新メンバーをスカウト！
          </motion.p>

          <motion.button
            onClick={handleScout}
            disabled={isScounting}
            whileHover={{ scale: 1.1, rotate: [0, -2, 2, 0] }}
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: ["0 0 20px rgba(251, 191, 36, 0.5)", "0 0 40px rgba(236, 72, 153, 0.8)", "0 0 20px rgba(251, 191, 36, 0.5)"] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 hover:from-yellow-500 hover:via-pink-500 hover:to-purple-500 text-white font-black py-4 px-12 rounded-full transition-all shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed text-lg relative overflow-hidden"
          >
            {isScounting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="inline-block h-5 w-5 animate-spin" />
                スカウト中...
              </span>
            ) : (
              <>
                <span className="relative z-10">💖 スカウト実行 (1000G) 💖</span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </>
            )}
          </motion.button>

          <p className="text-xs text-pink-400 mt-2">
            ※ガチャバナーが設定されていない場合は失敗します
          </p>
        </div>
      </div>
    </div>
  );
}

function ShopScreen() {
  const items = [
    { item: "エネルギードリンク", price: "100G", icon: "⚡", color: "from-yellow-400 to-orange-400" },
    { item: "プレミアムパス", price: "500G", icon: "🎟️", color: "from-purple-400 to-pink-400" },
    { item: "トレーニング器具", price: "300G", icon: "🏋️", color: "from-red-400 to-pink-400" },
    { item: "ステージ衣装", price: "800G", icon: "👗", color: "from-cyan-400 to-blue-400" },
  ];

  return (
    <div className="space-y-6">
      <motion.h2
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="text-3xl font-black text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent"
      >
        🛍️ SHOP 💖
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item, index) => (
          <motion.div
            key={item.item}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05, rotate: [0, -1, 1, 0] }}
            className={`bg-gradient-to-br ${item.color} p-[3px] rounded-xl cursor-pointer shadow-xl hover:shadow-2xl transition-all relative overflow-hidden`}
          >
            {/* Holographic effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity rounded-xl animate-shimmer" />
            <div className="bg-white/95 rounded-xl p-4 backdrop-blur-sm relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: index * 0.3 }}
                    className="text-5xl"
                  >
                    {item.icon}
                  </motion.span>
                  <div>
                    <div className="font-black text-gray-800">{item.item}</div>
                    <div className="text-sm text-pink-600 font-bold">{item.price}</div>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold transition-colors shadow-lg relative overflow-hidden"
                >
                  <span className="relative z-10">購入 💕</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      <p className="text-xs text-pink-400 text-center mt-6 font-semibold">
        ※ショップ機能は開発中です
      </p>
    </div>
  );
}

export default function MusclePrismPage() {
  const [tab, setTab] = useState("home");
  const { player, isLoading } = usePlayerProfile();

  if (isLoading) {
    return (
      <div className="min-h-screen text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin text-pink-400 mx-auto mb-4" />
          <p className="text-pink-300 font-bold">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white relative overflow-hidden">{/* GlobalEffects provides background */}

      {/* Header */}
      <div className="border-b-2 border-pink-400/30 backdrop-blur-md bg-zinc-900/30 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center relative"
          >
            {/* Back button */}
            <Link href="/home">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute left-0 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-400/50 font-bold hover:from-pink-500/40 hover:to-purple-500/40 transition-all"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Home</span>
              </motion.button>
            </Link>

            <div className="flex items-center justify-center gap-3 mb-2">
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 animate-pulse" />
              <h1 className="text-3xl font-black tracking-wider bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                MUSCLE☆PRISM
              </h1>
              <Star className="h-6 w-6 text-yellow-400 fill-yellow-400 animate-pulse" />
            </div>
            <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500/30 to-purple-500/30 border border-pink-400/50 font-bold">
                👤 {player?.username || "Player"}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-500/30 to-cyan-500/30 border border-purple-400/50 font-bold">
                ⭐ Lv.{player?.level || 1}
              </span>
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-400/50 font-bold">
                💰 {player?.gold?.toLocaleString() || 0}G
              </span>
              <span className="px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/30 to-blue-500/30 border border-cyan-400/50 font-bold">
                💎 {player?.gems || 0}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 max-w-6xl relative z-10">
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-5 w-full rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 backdrop-blur-sm border-2 border-pink-400/30 p-2 shadow-xl">
            {[
              { value: "home", icon: Sparkles, label: "Home" },
              { value: "training", icon: Dumbbell, label: "Training" },
              { value: "battle", icon: Swords, label: "Battle" },
              { value: "scout", icon: Users, label: "Scout" },
              { value: "shop", icon: ShoppingBag, label: "Shop" },
            ].map((tabItem) => (
              <TabsTrigger
                key={tabItem.value}
                value={tabItem.value}
                className="rounded-xl flex gap-2 font-bold data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/40 data-[state=active]:to-cyan-500/40 data-[state=active]:shadow-lg data-[state=active]:scale-105 transition-all"
              >
                <tabItem.icon className="h-5 w-5" />
                <span className="hidden sm:inline">{tabItem.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8"
          >
            <TabsContent value="home">
              <HomeScreen />
            </TabsContent>
            <TabsContent value="training">
              <TrainingScreen />
            </TabsContent>
            <TabsContent value="battle">
              <ColosseumScreen />
            </TabsContent>
            <TabsContent value="scout">
              <ScoutScreen />
            </TabsContent>
            <TabsContent value="shop">
              <ShopScreen />
            </TabsContent>
          </motion.div>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-pink-300 pb-8 pt-4 font-semibold relative z-10">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨ Powered by MUSCLE☆PRISM ✨
        </motion.div>
      </div>
    </div>
  );
}

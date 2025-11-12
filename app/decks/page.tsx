'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Deck {
  id: string;
  name: string;
  cardIds: string[];
  totalCost: number;
  isActive: boolean;
}

export default function DecksPage() {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDecks();
  }, []);

  const fetchDecks = async () => {
    try {
      const response = await fetch('/api/decks');
      const data = await response.json();

      if (data.success) {
        setDecks(data.data.decks || []);
      }
    } catch (error) {
      console.error('Failed to fetch decks:', error);
    } finally {
      setLoading(false);
    }
  };

  const setActiveDeck = async (deckId: string) => {
    try {
      const response = await fetch(`/api/decks/${deckId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: true }),
      });

      const data = await response.json();

      if (data.success) {
        await fetchDecks();
      } else {
        alert(data.error?.message || 'デッキの設定に失敗しました');
      }
    } catch (error) {
      console.error('Failed to set active deck:', error);
      alert('デッキの設定に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">デッキを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold">デッキ編成</h1>
          <Link
            href="/home"
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            ← ホームに戻る
          </Link>
        </div>

        <div className="mb-6">
          <button
            onClick={() => alert('デッキ作成機能は未実装です')}
            className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            + 新しいデッキを作成
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-600 text-lg mb-4">デッキがありません</p>
            <button
              onClick={() => alert('デッキ作成機能は未実装です')}
              className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
            >
              デッキを作成する
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {decks.map((deck) => (
              <div
                key={deck.id}
                className={`bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow ${
                  deck.isActive ? 'ring-4 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{deck.name}</h2>
                  {deck.isActive && (
                    <span className="px-3 py-1 bg-blue-500 text-white text-xs font-semibold rounded-full">
                      使用中
                    </span>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">カード数:</span>
                    <span className="font-semibold">{Array.isArray(deck.cardIds) ? deck.cardIds.length : 0} 枚</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">総コスト:</span>
                    <span className="font-semibold">{deck.totalCost} / 200</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        deck.totalCost > 200 ? 'bg-red-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min((deck.totalCost / 200) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  {!deck.isActive && (
                    <button
                      onClick={() => setActiveDeck(deck.id)}
                      className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition-colors font-semibold"
                    >
                      このデッキを使用する
                    </button>
                  )}
                  <button
                    onClick={() => alert('デッキ編集機能は未実装です')}
                    className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition-colors font-semibold"
                  >
                    編集
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-bold text-blue-900 mb-2">デッキ編成のルール</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• デッキには20〜40枚のカードを入れることができます</li>
            <li>• 同じカードは最大3枚まで入れられます</li>
            <li>• デッキの総コストは200以下にする必要があります</li>
            <li>• 最大5つまでデッキを作成できます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

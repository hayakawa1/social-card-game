'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleDevLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/dev-login', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        // Reload to update session
        window.location.href = '/home';
      } else {
        setError(data.error || 'ログインに失敗しました');
      }
    } catch (err) {
      setError('ログインに失敗しました');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Social Card Game
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleDevLogin}
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '処理中...' : '🚀 開発用ログイン (DEV_USER)'}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">または</span>
            </div>
          </div>

          <div className="space-y-3">
            <input
              type="email"
              placeholder="メールアドレス"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
            <input
              type="password"
              placeholder="パスワード"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled
            />
            <button
              disabled
              className="w-full bg-gray-300 text-gray-500 py-3 px-6 rounded-lg font-semibold cursor-not-allowed"
            >
              ログイン (未実装)
            </button>
          </div>

          <div className="text-center">
            <button
              disabled
              className="text-blue-600 hover:underline text-sm cursor-not-allowed opacity-50"
            >
              アカウント登録 (未実装)
            </button>
          </div>
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">開発用情報:</p>
          <p>メール: dev@test.com</p>
          <p>パスワード: dev123</p>
        </div>
      </div>
    </div>
  );
}

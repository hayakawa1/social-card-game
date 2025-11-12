'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Friend {
  id: string;
  playerId: string;
  friendId: string;
  friendName: string;
  friendshipPoints: number;
  lastInteraction: string;
  createdAt: string;
}

interface FriendRequest {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  status: string;
  createdAt: string;
}

interface SearchResult {
  id: string;
  username: string;
  level: number;
}

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      await Promise.all([
        fetchFriends(),
        fetchRequests('received'),
        fetchRequests('sent'),
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      const data = await response.json();

      if (data.success) {
        setFriends(data.data.friends || []);
      }
    } catch (error) {
      console.error('Failed to fetch friends:', error);
    }
  };

  const fetchRequests = async (type: 'sent' | 'received') => {
    try {
      const response = await fetch(`/api/friends/requests?type=${type}`);
      const data = await response.json();

      if (data.success) {
        if (type === 'received') {
          setReceivedRequests(data.data.requests || []);
        } else {
          setSentRequests(data.data.requests || []);
        }
      }
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (data.success) {
        setSearchResults(data.data.users || []);
      }
    } catch (error) {
      console.error('Failed to search users:', error);
    }
  };

  const sendFriendRequest = async (username: string) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });

      const data = await response.json();

      if (data.success) {
        alert('フレンドリクエストを送信しました');
        await fetchRequests('sent');
        setSearchQuery('');
        setSearchResults([]);
      } else {
        alert(data.error?.message || 'リクエストの送信に失敗しました');
      }
    } catch (error) {
      console.error('Failed to send friend request:', error);
      alert('リクエストの送信に失敗しました');
    }
  };

  const acceptRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends/accept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('フレンドリクエストを承認しました');
        await fetchData();
      } else {
        alert(data.error?.message || '承認に失敗しました');
      }
    } catch (error) {
      console.error('Failed to accept request:', error);
      alert('承認に失敗しました');
    }
  };

  const rejectRequest = async (requestId: string) => {
    try {
      const response = await fetch('/api/friends/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      const data = await response.json();

      if (data.success) {
        alert('フレンドリクエストを拒否しました');
        await fetchRequests('received');
      } else {
        alert(data.error?.message || '拒否に失敗しました');
      }
    } catch (error) {
      console.error('Failed to reject request:', error);
      alert('拒否に失敗しました');
    }
  };

  const removeFriend = async (friendshipId: string) => {
    if (!confirm('本当にこのフレンドを削除しますか？')) {
      return;
    }

    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('フレンドを削除しました');
        await fetchFriends();
      } else {
        alert(data.error?.message || '削除に失敗しました');
      }
    } catch (error) {
      console.error('Failed to remove friend:', error);
      alert('削除に失敗しました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-900 to-amber-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-400 mx-auto"></div>
          <p className="mt-4 text-yellow-200 text-lg font-semibold">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-yellow-900 to-amber-900">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl" style={{ top: '10%', left: '10%' }}></div>
        <div className="absolute w-96 h-96 bg-orange-500/10 rounded-full blur-3xl" style={{ bottom: '10%', right: '10%' }}></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 flex justify-between items-center">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-2xl px-8 py-4 border-4 border-yellow-300">
            <h1 className="text-4xl font-bold text-white drop-shadow-lg">👥 フレンド</h1>
          </div>
          <Link
            href="/home"
            className="px-6 py-3 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all font-bold border-2 border-gray-500 shadow-xl"
          >
            ← ホームに戻る
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-6 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border-4 border-yellow-300/50 overflow-hidden">
          <div className="flex">
            <button
              onClick={() => setActiveTab('friends')}
              className={`flex-1 py-4 px-6 text-center font-bold transition-all ${
                activeTab === 'friends'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-yellow-200 hover:bg-white/10'
              }`}
            >
              👥 フレンド一覧 ({friends.length})
            </button>
            <button
              onClick={() => setActiveTab('requests')}
              className={`flex-1 py-4 px-6 text-center font-bold transition-all relative ${
                activeTab === 'requests'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-yellow-200 hover:bg-white/10'
              }`}
            >
              📬 リクエスト
              {receivedRequests.length > 0 && (
                <span className="absolute top-2 right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold border-2 border-white animate-pulse">
                  {receivedRequests.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('search')}
              className={`flex-1 py-4 px-6 text-center font-bold transition-all ${
                activeTab === 'search'
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg'
                  : 'text-yellow-200 hover:bg-white/10'
              }`}
            >
              🔍 ユーザー検索
            </button>
          </div>
        </div>

        {/* Friends List */}
        {activeTab === 'friends' && (
          <div className="space-y-4">
            {friends.length === 0 ? (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-12 text-center border-4 border-gray-700">
                <p className="text-gray-300 text-2xl font-bold mb-6">フレンドがいません</p>
                <button
                  onClick={() => setActiveTab('search')}
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-400 hover:to-cyan-500 transition-all shadow-2xl border-4 border-cyan-300 text-lg"
                >
                  🔍 ユーザーを検索
                </button>
              </div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="group bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 flex items-center justify-between border-4 border-yellow-300/50 hover:border-yellow-400 transition-all hover:scale-[1.02]"
                >
                  <div>
                    <h3 className="text-2xl font-bold mb-3 text-white drop-shadow-lg">👤 {friend.friendName}</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg">
                        <span className="text-yellow-300 font-semibold">⭐ フレンドポイント:</span>
                        <span className="font-bold text-yellow-400">{friend.friendshipPoints}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg">
                        <span className="text-cyan-300 font-semibold">📅 フレンド登録日:</span>
                        <span className="font-bold text-white">
                          {new Date(friend.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:from-red-400 hover:to-rose-500 transition-all shadow-xl border-2 border-red-300"
                  >
                    ❌ 削除
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-6">
            {/* Received Requests */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">📬 受信したリクエスト</h2>
              {receivedRequests.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center text-gray-300 border-4 border-gray-700">
                  受信したリクエストはありません
                </div>
              ) : (
                <div className="space-y-4">
                  {receivedRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 flex items-center justify-between border-4 border-green-300/50 hover:border-green-400 transition-all hover:scale-[1.02]"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-lg mb-2">👤 {request.senderName}</h3>
                        <p className="text-sm text-cyan-300 bg-black/20 px-3 py-1 rounded-lg inline-block">
                          📅 {new Date(request.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => acceptRequest(request.id)}
                          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl font-bold hover:from-green-400 hover:to-emerald-500 transition-all shadow-xl border-2 border-green-300"
                        >
                          ✓ 承認
                        </button>
                        <button
                          onClick={() => rejectRequest(request.id)}
                          className="px-6 py-3 bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl font-bold hover:from-red-400 hover:to-rose-500 transition-all shadow-xl border-2 border-red-300"
                        >
                          ✗ 拒否
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sent Requests */}
            <div>
              <h2 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">📤 送信したリクエスト</h2>
              {sentRequests.length === 0 ? (
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center text-gray-300 border-4 border-gray-700">
                  送信したリクエストはありません
                </div>
              ) : (
                <div className="space-y-4">
                  {sentRequests.map((request) => (
                    <div
                      key={request.id}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 flex items-center justify-between border-4 border-yellow-300/50"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-lg mb-2">👤 {request.receiverName}</h3>
                        <p className="text-sm text-cyan-300 bg-black/20 px-3 py-1 rounded-lg inline-block">
                          📅 {new Date(request.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <span className="px-6 py-3 bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-xl text-sm font-bold shadow-xl border-2 border-yellow-300 animate-pulse">
                        ⏳ 承認待ち
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === 'search' && (
          <div>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mb-6 border-4 border-yellow-300/50">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                placeholder="🔍 ユーザー名を入力（2文字以上）"
                className="w-full px-6 py-4 bg-gray-700 border-2 border-yellow-400 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-yellow-500 font-semibold text-lg placeholder-gray-400"
              />
            </div>

            {searchQuery.length >= 2 && (
              <div className="space-y-4">
                {searchResults.length === 0 ? (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center text-gray-300 border-4 border-gray-700">
                    ユーザーが見つかりませんでした
                  </div>
                ) : (
                  searchResults.map((user) => (
                    <div
                      key={user.id}
                      className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 flex items-center justify-between border-4 border-blue-300/50 hover:border-blue-400 transition-all hover:scale-[1.02]"
                    >
                      <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-lg mb-2">👤 {user.username}</h3>
                        <p className="text-sm text-purple-300 bg-black/20 px-3 py-1 rounded-lg inline-block font-semibold">
                          ⭐ レベル: {user.level}
                        </p>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.username)}
                        className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-600 text-white rounded-xl font-bold hover:from-blue-400 hover:to-cyan-500 transition-all shadow-xl border-2 border-blue-300"
                      >
                        📤 リクエスト送信
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

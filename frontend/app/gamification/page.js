'use client';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

export default function GamificationPage() {
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId');
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchGamification();
      fetchLeaderboard();
      fetchBadges();
    } else {
      // userId yoksa da leaderboard'u yükle
      fetchLeaderboard();
      setLoading(false);
    }
  }, [userId]);

  const fetchGamification = async () => {
    try {
      const response = await fetch(`http://localhost:6602/api/gamification/${userId}`);
      const data = await response.json();
      
      if (data && typeof data === 'object') {
        setGamification(data);
      } else {
        console.error('Gamification verisi geçersiz:', data);
        toast.error('Gamification verisi geçersiz format');
      }
    } catch (error) {
      console.error('Gamification verisi alınamadı:', error);
      toast.error('Gamification verisi yüklenirken hata oluştu');
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`http://localhost:6602/api/gamification/leaderboard`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setLeaderboard(data);
      } else {
        console.error('Liderlik tablosu array değil:', data);
        setLeaderboard([]);
      }
    } catch (error) {
      console.error('Liderlik tablosu alınamadı:', error);
      setLeaderboard([]);
    }
  };

  const fetchBadges = async () => {
    try {
      const response = await fetch(`http://localhost:6602/api/gamification/${userId}/badges`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setBadges(data);
      } else {
        console.error('Rozetler array değil:', data);
        setBadges([]);
      }
    } catch (error) {
      console.error('Rozetler alınamadı:', error);
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId && typeof window !== 'undefined') {
      setLoading(false);
    }
  }, [userId]);

  const updateTaskProgress = async (taskId, progress) => {
    try {
      const response = await fetch(`http://localhost:6602/api/gamification/${userId}/tasks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ taskId, progress }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success(data.message);
        fetchGamification();
      } else {
        toast.error(data.message || 'Görev güncellenirken hata oluştu');
      }
    } catch (error) {
      console.error('Görev güncellenirken hata:', error);
      toast.error('Görev güncellenirken hata oluştu');
    }
  };

  const getLevelColor = (level) => {
    const colors = {
      Bronze: 'text-amber-600',
      Silver: 'text-gray-500',
      Gold: 'text-yellow-500',
      Platinum: 'text-cyan-500',
      Diamond: 'text-purple-500'
    };
    return colors[level] || 'text-gray-600';
  };

  const getLevelIcon = (level) => {
    const icons = {
      Bronze: '🥉',
      Silver: '🥈',
      Gold: '🥇',
      Platinum: '💎',
      Diamond: '👑'
    };
    return icons[level] || '⭐';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
              <div className="h-64 bg-gray-300 dark:bg-gray-600 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!gamification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 p-8">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Gamification Sistemi
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gamification verisi yüklenemedi.
          </p>
        </div>
      </div>
    );
  }

  return (
          <div className="min-h-screen bg-white dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-2">
            🎮 Gamification Sistemi
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Puanlarını topla, rozetler kazan ve seviye atla!
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-1 shadow-lg">
            {['overview', 'tasks', 'badges', 'leaderboard'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-md transition-colors ${
                  activeTab === tab
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:text-blue-500'
                }`}
              >
                {tab === 'overview' && '📊 Genel Bakış'}
                {tab === 'tasks' && '✅ Günlük Görevler'}
                {tab === 'badges' && '🏆 Rozetler'}
                {tab === 'leaderboard' && '🏅 Liderlik Tablosu'}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Puanlar ve Seviye */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="text-center">
                <div className="text-4xl mb-2">{getLevelIcon(gamification.level)}</div>
                <h3 className={`text-2xl font-bold ${getLevelColor(gamification.level)}`}>
                  {gamification.level}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {gamification.points} Puan
                </p>
                
                {/* Seviye İlerleme */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span>İlerleme</span>
                    <span>{Math.round(gamification.progressToNextLevel)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${gamification.progressToNextLevel}%` }}
                    ></div>
                  </div>
                  {gamification.nextLevel && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Sonraki seviye: {gamification.nextLevel}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* İstatistikler */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                📈 İstatistikler
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Toplam Alışveriş:</span>
                  <span className="font-semibold">{gamification.statistics.totalPurchases}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Toplam Harcama:</span>
                  <span className="font-semibold">{gamification.statistics.totalSpent} TL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Favori Ürünler:</span>
                  <span className="font-semibold">{gamification.statistics.favoriteProducts}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Giriş Serisi:</span>
                  <span className="font-semibold">{gamification.statistics.loginStreak} gün</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Kazanılan Rozetler:</span>
                  <span className="font-semibold">{gamification.statistics.badgesEarned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">Tamamlanan Görevler:</span>
                  <span className="font-semibold">{gamification.statistics.tasksCompleted}</span>
                </div>
              </div>
            </div>

            {/* Son Kazanılan Rozetler */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                🏆 Son Rozetler
              </h3>
              <div className="space-y-3">
                {gamification.badges.slice(0, 3).map((badge) => (
                  <div key={badge.id} className="flex items-center space-x-3">
                    <div className="text-2xl">{badge.icon}</div>
                    <div>
                      <p className="font-semibold text-gray-800 dark:text-white">
                        {badge.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
                {gamification.badges.length === 0 && (
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    Henüz rozet kazanmadın
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              ✅ Günlük Görevler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {gamification.dailyTasks.map((task) => (
                <div
                  key={task.id}
                  className={`border rounded-lg p-4 ${
                    task.completed
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-gray-800 dark:text-white">
                        {task.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {task.description}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        +{task.reward} puan
                      </div>
                      {task.completed && (
                        <div className="text-green-600 dark:text-green-400 text-sm">
                          ✅ Tamamlandı
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                      <span>İlerleme</span>
                      <span>{task.progress}/{task.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          task.completed
                            ? 'bg-green-500'
                            : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min((task.progress / task.maxProgress) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Task Actions */}
                  {!task.completed && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateTaskProgress(task.id, task.progress + 1)}
                        className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 transition-colors"
                      >
                        İlerlet
                      </button>
                      <button
                        onClick={() => updateTaskProgress(task.id, task.maxProgress)}
                        className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 transition-colors"
                      >
                        Tamamla
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === 'badges' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              🏆 Rozetler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`border rounded-lg p-4 text-center transition-all duration-300 ${
                    badge.earned
                      ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 shadow-lg'
                      : 'border-gray-200 dark:border-gray-600 opacity-60'
                  }`}
                >
                  <div className="text-4xl mb-3">{badge.icon}</div>
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                    {badge.description}
                  </p>
                  
                  {/* Progress */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-600 dark:text-gray-300 mb-1">
                      <span>İlerleme</span>
                      <span>{badge.progress}/{badge.maxProgress}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${
                          badge.earned
                            ? 'bg-yellow-500'
                            : 'bg-blue-500'
                        }`}
                        style={{
                          width: `${Math.min((badge.progress / badge.maxProgress) * 100, 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {badge.earned && (
                    <div className="text-yellow-600 dark:text-yellow-400 text-sm">
                      ✅ {new Date(badge.earnedAt).toLocaleDateString('tr-TR')} tarihinde kazanıldı
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
              🏅 Liderlik Tablosu
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-600">
                    <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">
                      Sıra
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">
                      Kullanıcı
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">
                      Seviye
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">
                      Puan
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">
                      Alışveriş
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-white">
                      Harcama
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.map((user, index) => (
                    <tr
                      key={user.username}
                      className={`border-b border-gray-100 dark:border-gray-700 ${
                        user.username === localStorage.getItem('username')
                          ? 'bg-blue-50 dark:bg-blue-900/20'
                          : ''
                      }`}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          {index < 3 ? (
                            <span className="text-2xl mr-2">
                              {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                            </span>
                          ) : (
                            <span className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-sm font-semibold">
                              {index + 1}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white">
                        {user.username}
                        {user.username === localStorage.getItem('username') && (
                          <span className="ml-2 text-blue-600 dark:text-blue-400 text-sm">
                            (Sen)
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-semibold ${getLevelColor(user.level)}`}>
                          {getLevelIcon(user.level)} {user.level}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-800 dark:text-white">
                        {user.points}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {user.totalPurchases}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-300">
                        {user.totalSpent} TL
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
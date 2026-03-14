import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../../../lib/auth'
import Library3D from '../../../components/Library3D'
import Toast from '../../../components/Toast'

export default function Palace3DView() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [palace, setPalace] = useState(null)
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState('3d') // '3d' or '2d'
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    if (id) {
      fetchPalace(currentUser.id)
    }
  }, [id, router])

  const fetchPalace = async (userId) => {
    try {
      const res = await fetch(`/api/palaces/${id}?userId=${userId}`)
      const data = await res.json()
      setPalace(data)
      setLoading(false)
    } catch (error) {
      console.error('获取宫殿详情失败:', error)
      setLoading(false)
    }
  }

  const handleRoomClick = (roomId) => {
    router.push(`/palace/${id}/room/${roomId}`)
  }

  const toggleViewMode = () => {
    setViewMode(viewMode === '3d' ? '2d' : '3d')
    setToastMessage(viewMode === '3d' ? '切换到列表视图' : '切换到 3D 视图')
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  if (loading) {
    return (
      <div className="tech-bg min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-lg">加载中...</div>
      </div>
    )
  }

  if (!palace) {
    return (
      <div className="tech-bg min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-lg">图书馆不存在</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{palace.name} - 3D 图书馆 - 记忆宫殿</title>
        <meta name="description" content={palace.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="relative">
        {/* 3D 视图 */}
        {viewMode === '3d' && (
          <Library3D palace={palace} onRoomClick={handleRoomClick} />
        )}

        {/* 2D 列表视图（备用） */}
        {viewMode === '2d' && (
          <div className="tech-bg min-h-screen p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
              {/* 头部 */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div className="flex items-center gap-4">
                  <Link href="/palaces" className="text-white/60 hover:text-white text-sm transition-colors">
                    ← 返回图书馆列表
                  </Link>
                  <Link href="/settings" className="text-white/60 hover:text-white text-sm transition-colors">
                    ⚙️ 设置
                  </Link>
                </div>
                {user && (
                  <div className="flex items-center gap-4">
                    <div className="ios-card px-4 py-2">
                      <span className="text-white/80 text-sm">👤 {user.name}</span>
                    </div>
                    <button
                      onClick={() => {
                        logout()
                        router.push('/login')
                      }}
                      className="text-white/60 hover:text-white text-sm transition-colors btn-press"
                    >
                      退出
                    </button>
                  </div>
                )}
              </div>

              {/* 图书馆信息 */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-3xl border border-white/10">
                  📚
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold text-white neon-glow mb-1">
                    {palace.name}
                  </h1>
                  <p className="text-white/60 text-sm">
                    {palace.description || '知识图书馆'} · {palace.rooms?.length || 0} 个书架
                  </p>
                </div>
              </div>

              {/* 书架列表 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {palace.rooms?.map((room, index) => (
                  <div
                    key={room.id}
                    onClick={() => handleRoomClick(room.id)}
                    className="library-shelf group animate-fade-in-up cursor-pointer"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-2xl border border-white/10 group-hover:scale-110 transition-transform duration-300">
                        📖
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                          {room.name}
                        </h3>
                        <p className="text-white/50 text-sm truncate">
                          {room.description || '暂无描述'}
                        </p>
                      </div>
                    </div>
                    <div className="tech-line my-4" />
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="tech-dot" />
                        <span className="text-white/60 text-sm">
                          {room.memories?.length || 0} 本书
                        </span>
                      </div>
                      <span className="text-white/60 text-sm group-hover:text-cyan-400 transition-colors">
                        进入 →
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {(!palace.rooms || palace.rooms.length === 0) && (
                <div className="empty-shelf animate-fade-in-up text-center py-12">
                  <div className="text-6xl mb-4">📚</div>
                  <p className="text-xl font-semibold mb-2">还没有书架</p>
                  <p className="text-white/50 text-sm">切换到 3D 视图创建书架</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="fixed top-4 left-4 z-50 flex gap-2">
          <Link href="/palaces">
            <button className="ios-card px-4 py-2 text-white/80 hover:text-white transition-colors btn-press">
              ← 返回
            </button>
          </Link>
          <button
            onClick={toggleViewMode}
            className="ios-card px-4 py-2 text-white/80 hover:text-white transition-colors btn-press"
          >
            {viewMode === '3d' ? '📋 列表' : '🏰 3D'}
          </button>
        </div>

        {/* 图书馆信息面板 */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 ios-card px-6 py-3 pointer-events-none">
          <h2 className="text-white font-bold text-lg text-center">{palace.name}</h2>
          <p className="text-white/60 text-xs text-center">{palace.rooms?.length || 0} 个书架</p>
        </div>

        {/* Toast 提示 */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="ios-card px-6 py-3 bg-black/80 border border-white/10 animate-fade-in-up">
              <span className="text-white text-sm">{toastMessage}</span>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

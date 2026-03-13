import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../../lib/auth'

export default function PalaceDetail() {
  const router = useRouter()
  const { id } = router.query
  const [user, setUser] = useState(null)
  const [palace, setPalace] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [loading, setLoading] = useState(true)

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

  const handleCreateRoom = async (e) => {
    e.preventDefault()
    if (!newRoomName.trim() || !user) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newRoomName,
          description: newRoomDesc
        })
      })
      
      if (res.ok) {
        await fetchPalace(user.id)
        setShowModal(false)
        setNewRoomName('')
        setNewRoomDesc('')
      }
    } catch (error) {
      console.error('创建房间失败:', error)
    }
  }

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('确定要删除这个书架吗？') || !user) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, roomId })
      })
      
      if (res.ok) {
        await fetchPalace(user.id)
      }
    } catch (error) {
      console.error('删除房间失败:', error)
    }
  }

  const handleLogout = () => {
    if (!confirm('确定要退出登录吗？')) return
    logout()
    router.push('/login')
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
        <title>{palace.name} - 记忆宫殿</title>
        <meta name="description" content={palace.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="tech-bg min-h-screen p-4 sm:p-8">
        {/* 头部 */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
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
                  onClick={handleLogout}
                  className="text-white/60 hover:text-white text-sm transition-colors btn-press"
                >
                  退出
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-3xl border border-white/10">
                📚
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white neon-glow mb-1">
                  {palace.name}
                </h1>
                <p className="text-white/60 text-sm">
                  {palace.description || '知识图书馆'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="ios-button flex items-center gap-2 btn-press"
            >
              <span>+</span>
              <span>新建书架</span>
            </button>
          </div>
        </div>

        {/* 书架（房间）列表 */}
        <div className="max-w-7xl mx-auto">
          {palace.rooms?.length === 0 ? (
            <div className="empty-shelf animate-fade-in-up" onClick={() => setShowModal(true)}>
              <div className="text-6xl mb-4 animate-float-3d">📚</div>
              <p className="text-xl font-semibold mb-2">还没有书架</p>
              <p className="text-white/50 text-sm mb-4">点击创建你的第一个书架</p>
              <button className="ios-button-secondary px-6 py-3 rounded-xl btn-press">
                + 创建书架
              </button>
            </div>
          ) : (
            <>
              {/* 书架标签 */}
              <div className="flex items-center gap-3 mb-6">
                <span className="tech-dot" />
                <span className="text-white/60 text-sm uppercase tracking-wider">
                  {palace.rooms.length} 个书架
                </span>
              </div>

              {/* 书架网格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {palace.rooms.map((room, index) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    palaceId={id}
                    index={index}
                    onDelete={() => handleDeleteRoom(room.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* 新建房间模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-md w-full animate-scale-in border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-2xl border border-white/10">
                  📚
                </div>
                <h2 className="text-2xl font-bold text-white">新建书架</h2>
              </div>
              
              <form onSubmit={handleCreateRoom}>
                <div className="mb-5">
                  <label className="block text-white/70 text-sm mb-2 font-medium">书架名称 *</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    placeholder="例如：英语词汇区"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white/70 text-sm mb-2 font-medium">描述</label>
                  <textarea
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    className="w-full ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                    placeholder="这个书架用来收藏什么类型的书籍？"
                    rows="3"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 ios-button-secondary py-3 rounded-xl font-medium btn-press"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 ios-button py-3 rounded-xl font-medium btn-press"
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function RoomCard({ room, palaceId, index, onDelete }) {
  return (
    <Link href={`/palace/${palaceId}/room/${room.id}`}>
      <div 
        className="library-shelf group animate-fade-in-up cursor-pointer"
        style={{ animationDelay: `${index * 80}ms` }}
      >
        {/* 书架顶部装饰 */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent rounded-t-2xl" />
        
        {/* 书架图标 */}
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

        {/* 分隔线 */}
        <div className="tech-line my-4" />

        {/* 书架信息 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="tech-dot" />
            <span className="text-white/60 text-sm">
              {room.memories?.length || 0} 本书
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/60 text-sm group-hover:text-cyan-400 transition-colors">
              进入 →
            </span>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                onDelete()
              }}
              className="text-white/40 hover:text-red-400 text-sm transition-colors btn-press"
            >
              删除
            </button>
          </div>
        </div>

        {/* 悬停光晕 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-cyan-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </div>
    </Link>
  )
}

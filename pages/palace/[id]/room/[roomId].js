import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

// 临时用户 ID（后续接入认证系统）
const USER_ID = 'demo-user-id'

export default function RoomDetail() {
  const router = useRouter()
  const { id, roomId } = router.query
  const [room, setRoom] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editMemory, setEditMemory] = useState(null)
  const [newMemoryTitle, setNewMemoryTitle] = useState('')
  const [newMemoryContent, setNewMemoryContent] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id && roomId) {
      fetchRoom()
    }
  }, [id, roomId])

  const fetchRoom = async () => {
    try {
      const res = await fetch(`/api/palaces/${id}?userId=${USER_ID}&roomId=${roomId}`)
      const data = await res.json()
      if (data.error) {
        setRoom(null)
      } else {
        setRoom(data)
      }
      setLoading(false)
    } catch (error) {
      console.error('获取房间详情失败:', error)
      setLoading(false)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setSearchResults(null)
      return
    }

    try {
      const res = await fetch(`/api/palaces/${id}?userId=${USER_ID}&search=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data)
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }

  const handleCreateMemory = async (e) => {
    e.preventDefault()
    if (!newMemoryTitle.trim()) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          roomId: roomId,
          title: newMemoryTitle,
          content: newMemoryContent
        })
      })
      
      if (res.ok) {
        await fetchRoom()
        setShowModal(false)
        setNewMemoryTitle('')
        setNewMemoryContent('')
      }
    } catch (error) {
      console.error('创建记忆失败:', error)
    }
  }

  const handleEditMemory = (memory) => {
    setEditMemory(memory)
    setNewMemoryTitle(memory.title)
    setNewMemoryContent(memory.content)
    setShowModal(true)
  }

  const handleUpdateMemory = async (e) => {
    e.preventDefault()
    if (!newMemoryTitle.trim() || !editMemory) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          roomId: roomId,
          memoryId: editMemory.id,
          title: newMemoryTitle,
          content: newMemoryContent
        })
      })
      
      if (res.ok) {
        await fetchRoom()
        setShowModal(false)
        setEditMemory(null)
        setNewMemoryTitle('')
        setNewMemoryContent('')
      }
    } catch (error) {
      console.error('更新记忆失败:', error)
    }
  }

  const handleDeleteMemory = async (memoryId) => {
    if (!confirm('确定要删除这条记忆吗？')) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: USER_ID,
          roomId: roomId,
          memoryId
        })
      })
      
      if (res.ok) {
        await fetchRoom()
      }
    } catch (error) {
      console.error('删除记忆失败:', error)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditMemory(null)
    setNewMemoryTitle('')
    setNewMemoryContent('')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/80 text-xl">加载中...</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/80 text-xl">房间不存在</div>
      </div>
    )
  }

  const displayMemories = searchResults || room.memories

  return (
    <>
      <Head>
        <title>{room.name} - 记忆宫殿</title>
        <meta name="description" content={room.description} />
      </Head>

      <div className="min-h-screen p-8">
        {/* 头部 */}
        <div className="max-w-6xl mx-auto mb-8">
          <Link href={`/palace/${id}`} className="text-white/80 hover:text-white mb-4 inline-block">
            ← 返回宫殿
          </Link>
          
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🚪 {room.name}</h1>
              <p className="text-white/70">{room.description}</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
            >
              + 添加记忆
            </button>
          </div>

          {/* 搜索框 */}
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex gap-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                placeholder="🔍 搜索记忆..."
              />
              <button
                type="submit"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
              >
                搜索
              </button>
              {searchResults && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults(null)
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
                >
                  清除
                </button>
              )}
            </div>
          </form>
        </div>

        {/* 记忆列表 */}
        <div className="max-w-6xl mx-auto">
          {displayMemories && displayMemories.length > 0 ? (
            <div className="space-y-4">
              {displayMemories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{memory.title}</h3>
                  <p className="text-white/70 whitespace-pre-wrap">{memory.content}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-white/50 text-sm">
                      {new Date(memory.updated_at || memory.created_at).toLocaleString('zh-CN')}
                    </span>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditMemory(memory)}
                        className="text-white/50 hover:text-white text-sm transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteMemory(memory.id)}
                        className="text-white/50 hover:text-red-300 text-sm transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-white/80 text-center py-20">
              <p className="text-2xl mb-4">💭 还没有记忆</p>
              <p>点击"添加记忆"开始记录你的第一个知识点吧！</p>
            </div>
          )}
        </div>

        {/* 添加/编辑记忆模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-xl p-8 max-w-md w-full border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editMemory ? '✏️ 编辑记忆' : '💭 添加记忆'}
              </h2>
              <form onSubmit={editMemory ? handleUpdateMemory : handleCreateMemory}>
                <div className="mb-4">
                  <label className="block text-white/80 text-sm mb-2">标题 *</label>
                  <input
                    type="text"
                    value={newMemoryTitle}
                    onChange={(e) => setNewMemoryTitle(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    placeholder="例如：apple - 苹果"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white/80 text-sm mb-2">内容</label>
                  <textarea
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 resize-none"
                    placeholder="详细的记忆内容..."
                    rows="4"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-all"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg font-medium transition-all"
                  >
                    {editMemory ? '更新' : '保存'}
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

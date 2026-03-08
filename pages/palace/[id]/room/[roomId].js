import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../../../lib/auth'

export default function RoomDetail() {
  const router = useRouter()
  const { id, roomId } = router.query
  const [user, setUser] = useState(null)
  const [room, setRoom] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editMemory, setEditMemory] = useState(null)
  const [newMemoryTitle, setNewMemoryTitle] = useState('')
  const [newMemoryContent, setNewMemoryContent] = useState('')
  const [newMemoryTags, setNewMemoryTags] = useState('')
  const [selectedTag, setSelectedTag] = useState(null)
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    
    if (id && roomId) {
      fetchRoom(currentUser.id)
      fetchTags()
    }
  }, [id, roomId, router])

  const fetchRoom = async (userId) => {
    try {
      const res = await fetch(`/api/palaces/${id}?userId=${userId}&roomId=${roomId}`)
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

  const fetchTags = async () => {
    try {
      const res = await fetch(`/api/palaces/${id}?userId=${user?.id}&getTags=true`)
      const data = await res.json()
      setAllTags(data)
    } catch (error) {
      console.error('获取标签失败:', error)
    }
  }

  const handleTagFilter = (tag) => {
    if (selectedTag === tag) {
      setSelectedTag(null)
      setSearchResults(null)
    } else {
      setSelectedTag(tag)
      fetchMemoriesByTag(tag)
    }
  }

  const fetchMemoriesByTag = async (tag) => {
    try {
      const res = await fetch(`/api/palaces/${id}?userId=${user.id}&tag=${encodeURIComponent(tag)}`)
      const data = await res.json()
      setSearchResults(data)
    } catch (error) {
      console.error('按标签筛选失败:', error)
    }
  }

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!searchQuery.trim() || !user) {
      setSearchResults(null)
      return
    }

    try {
      const res = await fetch(`/api/palaces/${id}?userId=${user.id}&search=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()
      setSearchResults(data)
    } catch (error) {
      console.error('搜索失败:', error)
    }
  }

  const handleCreateMemory = async (e) => {
    e.preventDefault()
    if (!newMemoryTitle.trim() || !user) return

    const tagsArray = newMemoryTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          roomId: roomId,
          title: newMemoryTitle,
          content: newMemoryContent,
          tags: tagsArray
        })
      })
      
      if (res.ok) {
        await fetchRoom(user.id)
        await fetchTags()
        setShowModal(false)
        setNewMemoryTitle('')
        setNewMemoryContent('')
        setNewMemoryTags('')
      }
    } catch (error) {
      console.error('创建记忆失败:', error)
    }
  }

  const handleEditMemory = (memory) => {
    setEditMemory(memory)
    setNewMemoryTitle(memory.title)
    setNewMemoryContent(memory.content)
    setNewMemoryTags(memory.tags?.join(', ') || '')
    setShowModal(true)
  }

  const handleUpdateMemory = async (e) => {
    e.preventDefault()
    if (!newMemoryTitle.trim() || !editMemory || !user) return

    const tagsArray = newMemoryTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0)

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          roomId: roomId,
          memoryId: editMemory.id,
          title: newMemoryTitle,
          content: newMemoryContent,
          tags: tagsArray
        })
      })
      
      if (res.ok) {
        await fetchRoom(user.id)
        await fetchTags()
        setShowModal(false)
        setEditMemory(null)
        setNewMemoryTitle('')
        setNewMemoryContent('')
        setNewMemoryTags('')
      }
    } catch (error) {
      console.error('更新记忆失败:', error)
    }
  }

  const handleDeleteMemory = async (memoryId) => {
    if (!confirm('确定要删除这条记忆吗？') || !user) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          roomId: roomId,
          memoryId
        })
      })
      
      if (res.ok) {
        await fetchRoom(user.id)
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
    setNewMemoryTags('')
  }

  const handleLogout = () => {
    if (!confirm('确定要退出登录吗？')) return
    logout()
    router.push('/login')
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
          <div className="flex justify-between items-center mb-4">
            <Link href={`/palace/${id}`} className="text-white/80 hover:text-white">
              ← 返回宫殿
            </Link>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-white/80">👤 {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-white/60 hover:text-white text-sm transition-colors"
                >
                  退出
                </button>
              </div>
            )}
          </div>
          
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
              {(searchResults || selectedTag) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setSearchResults(null)
                    setSelectedTag(null)
                  }}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
                >
                  清除
                </button>
              )}
            </div>
          </form>

          {/* 标签筛选 */}
          {allTags.length > 0 && (
            <div className="mb-6">
              <div className="text-white/60 text-sm mb-2">🏷️ 标签筛选:</div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagFilter(tag)}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      selectedTag === tag
                        ? 'bg-purple-500 text-white'
                        : 'bg-white/10 text-white/80 hover:bg-white/20'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}
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
                  {memory.tags && memory.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {memory.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-500/30 text-purple-200 rounded-full text-xs font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
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
                <div className="mb-4">
                  <label className="block text-white/80 text-sm mb-2">内容</label>
                  <textarea
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 resize-none"
                    placeholder="详细的记忆内容..."
                    rows="4"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white/80 text-sm mb-2">标签（用逗号分隔）</label>
                  <input
                    type="text"
                    value={newMemoryTags}
                    onChange={(e) => setNewMemoryTags(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    placeholder="例如：英语，词汇，重要"
                  />
                  <p className="text-white/50 text-xs mt-1">多个标签用逗号分隔，例如：英语，词汇，重要</p>
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

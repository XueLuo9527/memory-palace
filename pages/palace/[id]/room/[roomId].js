import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../../../../lib/auth'
import BookShelf, { BookDetailModal } from '../../../../components/BookShelf'

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
  const [newMemoryImage, setNewMemoryImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [selectedTag, setSelectedTag] = useState(null)
  const [allTags, setAllTags] = useState([])
  const [loading, setLoading] = useState(true)
  
  // 书籍详情模态框
  const [selectedBook, setSelectedBook] = useState(null)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [pendingDelete, setPendingDelete] = useState(null)

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

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      alert('请选择图片文件')
      return
    }

    // 验证文件大小（2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过 2MB')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      setNewMemoryImage(e.target.result)
      setImagePreview(e.target.result)
    }
    reader.readAsDataURL(file)
  }

  const removeImage = () => {
    setNewMemoryImage(null)
    setImagePreview(null)
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
          tags: tagsArray,
          image: newMemoryImage // 添加图片
        })
      })
      
      if (res.ok) {
        await fetchRoom(user.id)
        await fetchTags()
        setShowModal(false)
        setNewMemoryTitle('')
        setNewMemoryContent('')
        setNewMemoryTags('')
        setNewMemoryImage(null)
        setImagePreview(null)
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
    setNewMemoryImage(memory.image || null)
    setImagePreview(memory.image || null)
    setShowModal(true)
    setSelectedBook(null)
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

  const confirmDelete = (memoryId) => {
    setPendingDelete(memoryId)
    setShowConfirmDialog(true)
    setSelectedBook(null)
  }

  const handleDeleteMemory = async () => {
    if (!pendingDelete || !user) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          roomId: roomId,
          memoryId: pendingDelete
        })
      })
      
      if (res.ok) {
        await fetchRoom(user.id)
        setShowConfirmDialog(false)
        setPendingDelete(null)
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
      <div className="tech-bg min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-lg">加载中...</div>
      </div>
    )
  }

  if (!room) {
    return (
      <div className="tech-bg min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-lg">书架不存在</div>
      </div>
    )
  }

  const displayMemories = searchResults || room.memories || []

  return (
    <>
      <Head>
        <title>{room.name} - 记忆宫殿</title>
        <meta name="description" content={room.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="tech-bg min-h-screen p-4 sm:p-8 relative overflow-x-hidden">
        {/* 头部 */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link href={`/palace/${id}`} className="text-white/60 hover:text-white text-sm transition-colors">
                ← 返回图书馆
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
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-3xl border border-white/10">
                📖
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-white neon-glow mb-1">
                  {room.name}
                </h1>
                <p className="text-white/60 text-sm">
                  {room.description || '知识书架'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="ios-button flex items-center gap-2 btn-press"
            >
              <span>+</span>
              <span>添加书籍</span>
            </button>
          </div>

          {/* 搜索和筛选 */}
          <div className="ios-card p-4 mb-6">
            <form onSubmit={handleSearch} className="mb-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors"
                  placeholder="🔍 搜索书籍..."
                />
                <div className="flex gap-3">
                  <button
                    type="submit"
                    className="ios-button px-6 py-3 btn-press"
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
                      className="ios-button-secondary px-6 py-3 rounded-xl btn-press"
                    >
                      清除
                    </button>
                  )}
                </div>
              </div>
            </form>

            {/* 标签筛选 */}
            {allTags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="tech-dot" />
                  <span className="text-white/60 text-sm">标签筛选</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => handleTagFilter(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all btn-press ${
                        selectedTag === tag
                          ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white'
                          : 'ios-card text-white/70 hover:text-white'
                      }`}
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 书架区域 - 使用 BookShelf 组件 */}
        <div className="max-w-7xl mx-auto pb-12">
          <BookShelf
            memories={displayMemories.map(m => ({
              id: m.id,
              title: m.title,
              content: m.content,
              tags: m.tags,
              createdAt: m.created_at
            }))}
            onBookClick={(book) => setSelectedBook(book)}
            onAddBook={() => setShowModal(true)}
          />
        </div>

        {/* 添加/编辑记忆模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-lg w-full animate-scale-in border border-white/10 my-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-2xl border border-white/10">
                  {editMemory ? '✏️' : '📖'}
                </div>
                <h2 className="text-2xl font-bold text-white">
                  {editMemory ? '编辑书籍' : '添加新书籍'}
                </h2>
              </div>
              
              <form onSubmit={editMemory ? handleUpdateMemory : handleCreateMemory}>
                <div className="mb-5">
                  <label className="block text-white/70 text-sm mb-2 font-medium">书名 *</label>
                  <input
                    type="text"
                    value={newMemoryTitle}
                    onChange={(e) => setNewMemoryTitle(e.target.value)}
                    className="w-full ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    placeholder="例如：apple - 苹果"
                    autoFocus
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-white/70 text-sm mb-2 font-medium">内容</label>
                  <textarea
                    value={newMemoryContent}
                    onChange={(e) => setNewMemoryContent(e.target.value)}
                    className="w-full ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                    placeholder="书籍的详细内容..."
                    rows="5"
                  />
                </div>
                <div className="mb-5">
                  <label className="block text-white/70 text-sm mb-2 font-medium">封面图片（可选）</label>
                  <div className="ios-card bg-white/5 border border-white/10 rounded-xl p-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img 
                          src={imagePreview} 
                          alt="预览" 
                          className="w-full h-48 object-cover rounded-lg mb-3"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                        <div className="text-4xl mb-2">📷</div>
                        <span className="text-white/70 text-sm mb-2">点击上传图片</span>
                        <span className="text-white/50 text-xs">支持 JPG、PNG、GIF、WebP，最大 2MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                          disabled={uploading}
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-white/70 text-sm mb-2 font-medium">标签（用逗号分隔）</label>
                  <input
                    type="text"
                    value={newMemoryTags}
                    onChange={(e) => setNewMemoryTags(e.target.value)}
                    className="w-full ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    placeholder="例如：英语，词汇，重要"
                  />
                  <p className="text-white/50 text-xs mt-2">多个标签用逗号分隔</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 ios-button-secondary py-3 rounded-xl font-medium btn-press"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 ios-button py-3 rounded-xl font-medium btn-press"
                  >
                    {editMemory ? '更新' : '放入书架'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 书籍详情模态框 */}
        {selectedBook && (
          <BookDetailModal
            book={selectedBook}
            onClose={() => setSelectedBook(null)}
            onEdit={handleEditMemory}
            onDelete={() => confirmDelete(selectedBook.id)}
          />
        )}

        {/* 确认删除对话框 */}
        {showConfirmDialog && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel rounded-2xl p-6 max-w-sm w-full animate-scale-in border border-white/10">
              <div className="text-center mb-6">
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-3xl mx-auto mb-4">
                  🗑️
                </div>
                <h3 className="text-xl font-bold text-white mb-2">删除书籍</h3>
                <p className="text-white/60 text-sm">确定要删除这本书吗？此操作无法恢复。</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowConfirmDialog(false)
                    setPendingDelete(null)
                  }}
                  className="flex-1 ios-button-secondary py-3 rounded-xl font-medium btn-press"
                >
                  取消
                </button>
                <button
                  onClick={handleDeleteMemory}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-3 rounded-xl font-medium transition-colors btn-press"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function RoomDetail() {
  const router = useRouter()
  const { id, roomId } = router.query
  const [room, setRoom] = useState(null)
  const [showModal, setShowModal] = useState(false)
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
      const res = await fetch(`/api/palaces/${id}`)
      const data = await res.json()
      const foundRoom = data.rooms.find(r => r.id === parseInt(roomId))
      setRoom(foundRoom)
      setLoading(false)
    } catch (error) {
      console.error('获取房间详情失败:', error)
      setLoading(false)
    }
  }

  const handleCreateMemory = async (e) => {
    e.preventDefault()
    if (!newMemoryTitle.trim()) return

    // TODO: 实现记忆创建 API
    alert('记忆功能开发中... 明天继续！😊')
    setShowModal(false)
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
          <div className="flex justify-between items-center">
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
        </div>

        {/* 记忆列表 */}
        <div className="max-w-6xl mx-auto">
          {room.memories && room.memories.length > 0 ? (
            <div className="space-y-4">
              {room.memories.map((memory) => (
                <div
                  key={memory.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <h3 className="text-xl font-bold text-white mb-2">{memory.title}</h3>
                  <p className="text-white/70 whitespace-pre-wrap">{memory.content}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className="text-white/50 text-sm">
                      {new Date(memory.createdAt).toLocaleString('zh-CN')}
                    </span>
                    <button className="text-white/50 hover:text-white text-sm transition-colors">
                      编辑
                    </button>
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

        {/* 添加记忆模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-xl p-8 max-w-md w-full border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">💭 添加记忆</h2>
              <form onSubmit={handleCreateMemory}>
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
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-all"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg font-medium transition-all"
                  >
                    保存
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

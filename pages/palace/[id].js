import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'

export default function PalaceDetail() {
  const router = useRouter()
  const { id } = router.query
  const [palace, setPalace] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newRoomDesc, setNewRoomDesc] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      fetchPalace()
    }
  }, [id])

  const fetchPalace = async () => {
    try {
      const res = await fetch(`/api/palaces/${id}`)
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
    if (!newRoomName.trim()) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newRoomName,
          description: newRoomDesc
        })
      })
      
      if (res.ok) {
        await fetchPalace()
        setShowModal(false)
        setNewRoomName('')
        setNewRoomDesc('')
      }
    } catch (error) {
      console.error('创建房间失败:', error)
    }
  }

  const handleDeleteRoom = async (roomId) => {
    if (!confirm('确定要删除这个房间吗？')) return

    try {
      const res = await fetch(`/api/palaces/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomId })
      })
      
      if (res.ok) {
        await fetchPalace()
      }
    } catch (error) {
      console.error('删除房间失败:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/80 text-xl">加载中...</div>
      </div>
    )
  }

  if (!palace) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white/80 text-xl">宫殿不存在</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{palace.name} - 记忆宫殿</title>
        <meta name="description" content={palace.description} />
      </Head>

      <div className="min-h-screen p-8">
        {/* 头部 */}
        <div className="max-w-6xl mx-auto mb-8">
          <Link href="/palaces" className="text-white/80 hover:text-white mb-4 inline-block">
            ← 返回宫殿列表
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">🏰 {palace.name}</h1>
              <p className="text-white/70">{palace.description}</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
            >
              + 新建房间
            </button>
          </div>
        </div>

        {/* 房间列表 */}
        <div className="max-w-6xl mx-auto">
          {palace.rooms.length === 0 ? (
            <div className="text-white/80 text-center py-20">
              <p className="text-2xl mb-4">🚪 还没有房间</p>
              <p>点击"新建房间"开始添加你的第一个记忆空间吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {palace.rooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">🚪 {room.name}</h3>
                    <button
                      onClick={() => handleDeleteRoom(room.id)}
                      className="text-white/50 hover:text-red-300 text-sm transition-colors"
                    >
                      删除
                    </button>
                  </div>
                  <p className="text-white/70 text-sm mb-4">{room.description || '暂无描述'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-white/50 text-sm">
                      {room.memories?.length || 0} 个记忆
                    </span>
                    <Link
                      href={`/palace/${id}/room/${room.id}`}
                      className="text-white/80 hover:text-white text-sm font-medium transition-colors"
                    >
                      进入 →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 新建房间模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-xl p-8 max-w-md w-full border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🚪 新建房间</h2>
              <form onSubmit={handleCreateRoom}>
                <div className="mb-4">
                  <label className="block text-white/80 text-sm mb-2">房间名称 *</label>
                  <input
                    type="text"
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    placeholder="例如：词汇大厅"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white/80 text-sm mb-2">描述</label>
                  <textarea
                    value={newRoomDesc}
                    onChange={(e) => setNewRoomDesc(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 resize-none"
                    placeholder="这个房间是用来记什么的？"
                    rows="3"
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

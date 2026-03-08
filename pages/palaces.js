import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../lib/auth'

export default function Palaces() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [palaces, setPalaces] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newPalaceName, setNewPalaceName] = useState('')
  const [newPalaceDesc, setNewPalaceDesc] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (!currentUser) {
      router.push('/login')
      return
    }
    setUser(currentUser)
    fetchPalaces(currentUser.id)
  }, [router])

  const fetchPalaces = async (userId) => {
    try {
      const res = await fetch(`/api/palaces?userId=${userId}`)
      const data = await res.json()
      setPalaces(data)
      setLoading(false)
    } catch (error) {
      console.error('获取宫殿失败:', error)
      setLoading(false)
    }
  }

  const handleCreatePalace = async (e) => {
    e.preventDefault()
    if (!newPalaceName.trim() || !user) return

    try {
      const res = await fetch('/api/palaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          name: newPalaceName,
          description: newPalaceDesc
        })
      })
      
      if (res.ok) {
        await fetchPalaces(user.id)
        setShowModal(false)
        setNewPalaceName('')
        setNewPalaceDesc('')
      }
    } catch (error) {
      console.error('创建宫殿失败:', error)
    }
  }

  const handleDeletePalace = async (id) => {
    if (!confirm('确定要删除这座宫殿吗？') || !user) return

    try {
      const res = await fetch('/api/palaces', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, id })
      })
      
      if (res.ok) {
        await fetchPalaces(user.id)
      }
    } catch (error) {
      console.error('删除宫殿失败:', error)
    }
  }

  const handleLogout = () => {
    if (!confirm('确定要退出登录吗？')) return
    logout()
    router.push('/login')
  }

  return (
    <>
      <Head>
        <title>我的宫殿 - 记忆宫殿</title>
        <meta name="description" content="管理你的记忆宫殿" />
      </Head>

      <div className="min-h-screen p-8">
        {/* 头部 */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-between items-center mb-4">
            <Link href="/" className="text-white/80 hover:text-white">
              ← 返回首页
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
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-white">🏰 我的宫殿</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
            >
              + 新建宫殿
            </button>
          </div>
        </div>

        {/* 宫殿列表 */}
        <div className="max-w-6xl mx-auto">
          {loading ? (
            <div className="text-white/80 text-center py-20">加载中...</div>
          ) : palaces.length === 0 ? (
            <div className="text-white/80 text-center py-20">
              <p className="text-2xl mb-4">🌟 还没有宫殿</p>
              <p>点击"新建宫殿"开始创建你的第一座记忆宫殿吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {palaces.map((palace) => (
                <div
                  key={palace.id}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-all"
                >
                  <Link href={`/palace/${palace.id}`}>
                    <h3 className="text-xl font-bold text-white mb-2">{palace.name}</h3>
                    <p className="text-white/70 text-sm mb-4">{palace.description || '暂无描述'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-sm">
                        {palace.rooms?.length || 0} 个房间
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeletePalace(palace.id)
                        }}
                        className="text-white/50 hover:text-red-300 text-sm transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 新建宫殿模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-xl p-8 max-w-md w-full border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">🏰 新建宫殿</h2>
              <form onSubmit={handleCreatePalace}>
                <div className="mb-4">
                  <label className="block text-white/80 text-sm mb-2">宫殿名称 *</label>
                  <input
                    type="text"
                    value={newPalaceName}
                    onChange={(e) => setNewPalaceName(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
                    placeholder="例如：英语学习宫殿"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white/80 text-sm mb-2">描述</label>
                  <textarea
                    value={newPalaceDesc}
                    onChange={(e) => setNewPalaceDesc(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 resize-none"
                    placeholder="这座宫殿是用来记什么的？"
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

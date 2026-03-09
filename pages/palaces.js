import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { getCurrentUser, logout } from '../lib/auth'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { SkeletonList } from '../components/Skeleton'
import ParticleBackground from '../components/ParticleBackground'

export default function Palaces() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [palaces, setPalaces] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newPalaceName, setNewPalaceName] = useState('')
  const [newPalaceDesc, setNewPalaceDesc] = useState('')
  const [loading, setLoading] = useState(true)
  
  // Toast 和确认框状态
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  })
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true })
  }

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
        showToast('🎉 宫殿创建成功！', 'success')
      } else {
        showToast('创建失败，请重试', 'error')
      }
    } catch (error) {
      console.error('创建宫殿失败:', error)
      showToast('创建失败：' + error.message, 'error')
    }
  }

  const handleDeletePalace = (id) => {
    setConfirmDialog({
      isOpen: true,
      title: '🗑️ 删除宫殿',
      message: '确定要删除这座宫殿吗？删除后无法恢复，所有房间和记忆也会被删除。',
      type: 'danger',
      onConfirm: async () => {
        try {
          const res = await fetch('/api/palaces', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: user.id, id })
          })
          
          if (res.ok) {
            await fetchPalaces(user.id)
            showToast('宫殿已删除', 'success')
          } else {
            showToast('删除失败', 'error')
          }
        } catch (error) {
          console.error('删除宫殿失败:', error)
          showToast('删除失败：' + error.message, 'error')
        } finally {
          setConfirmDialog(prev => ({ ...prev, isOpen: false }))
        }
      }
    })
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

      <div className="min-h-screen p-4 sm:p-8 relative">
        {/* 3D 粒子背景 */}
        <ParticleBackground count={30} />
        
        {/* 头部 */}
        <div className="max-w-6xl mx-auto mb-8 relative z-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white/80 hover:text-white text-sm sm:text-base">
                ← 返回首页
              </Link>
              <Link href="/settings" className="text-white/80 hover:text-white text-sm sm:text-base">
                ⚙️ 设置
              </Link>
            </div>
            {user && (
              <div className="flex items-center gap-4">
                <span className="text-white/80 text-sm sm:text-base">👤 {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="text-white/60 hover:text-white text-xs sm:text-sm transition-colors"
                >
                  退出
                </button>
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-2xl sm:text-4xl font-bold text-white text-3d neon-text">🏰 我的宫殿</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30 text-sm sm:text-base w-full sm:w-auto btn-click depth-shadow-2 hover:depth-shadow-3"
            >
              + 新建宫殿
            </button>
          </div>
        </div>

        {/* 宫殿列表 */}
        <div className="max-w-6xl mx-auto relative z-10">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <SkeletonList count={3} />
            </div>
          ) : palaces.length === 0 ? (
            <div className="text-white/80 text-center py-20 px-4 animate-emerge">
              <p className="text-5xl mb-6 animate-float-3d">🏰</p>
              <p className="text-2xl sm:text-3xl mb-3 font-bold text-3d">还没有宫殿</p>
              <p className="text-sm sm:text-base text-white/60">点击"新建宫殿"开始创建你的第一座记忆宫殿吧！</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 perspective-1000">
              {palaces.map((palace, index) => (
                <div
                  key={palace.id}
                  className="card-3d bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20 depth-shadow-2 animate-emerge"
                  style={{ animationDelay: `${index * 80}ms` }}
                >
                  <Link href={`/palace/${palace.id}`}>
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{palace.name}</h3>
                    <p className="text-white/70 text-xs sm:text-sm mb-4">{palace.description || '暂无描述'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-white/50 text-xs sm:text-sm">
                        {palace.rooms?.length || 0} 个房间
                      </span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeletePalace(palace.id)
                        }}
                        className="text-white/50 hover:text-red-300 text-xs sm:text-sm transition-colors"
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-xl p-4 sm:p-8 max-w-md w-full border border-white/20 my-8">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">🏰 新建宫殿</h2>
              <form onSubmit={handleCreatePalace}>
                <div className="mb-4">
                  <label className="block text-white/80 text-xs sm:text-sm mb-2">宫殿名称 *</label>
                  <input
                    type="text"
                    value={newPalaceName}
                    onChange={(e) => setNewPalaceName(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 text-sm sm:text-base"
                    placeholder="例如：英语学习宫殿"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white/80 text-xs sm:text-sm mb-2">描述</label>
                  <textarea
                    value={newPalaceDesc}
                    onChange={(e) => setNewPalaceDesc(e.target.value)}
                    className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50 resize-none text-sm sm:text-base"
                    placeholder="这座宫殿是用来记什么的？"
                    rows="3"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-lg font-medium transition-all text-sm sm:text-base"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg font-medium transition-all text-sm sm:text-base"
                  >
                    创建
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Toast 提示 */}
        {toast.visible && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast({ ...toast, visible: false })}
          />
        )}

        {/* 确认对话框 */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          title={confirmDialog.title}
          message={confirmDialog.message}
          type={confirmDialog.type}
          onConfirm={confirmDialog.onConfirm}
          onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </>
  )
}

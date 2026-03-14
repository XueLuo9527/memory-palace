import { useState, useEffect, useContext } from 'react'
import { useRouter } from 'next/router'
import Head from 'next/head'
import Link from 'next/link'
import { UserContext } from './_app'
import Toast from '../components/Toast'
import ConfirmDialog from '../components/ConfirmDialog'
import { SkeletonList } from '../components/Skeleton'

export default function Palaces() {
  const router = useRouter()
  const { user, loading: authLoading, logout } = useContext(UserContext)
  
  const [palaces, setPalaces] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [newPalaceName, setNewPalaceName] = useState('')
  const [newPalaceDesc, setNewPalaceDesc] = useState('')
  const [loading, setLoading] = useState(true)
  
  const [toast, setToast] = useState({ message: '', type: 'info', visible: false })
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    type: 'info',
    onConfirm: null
  })
  const [mounted, setMounted] = useState(false)
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type, visible: true })
  }

  // 组件挂载时标记
  useEffect(() => {
    setMounted(true)
  }, [])

  // 认证检查 - 只在挂载后且加载完成后执行
  useEffect(() => {
    if (!mounted) return
    
    // 加载中的时候不跳转
    if (authLoading) return
    
    // 只有确定没有用户时才跳转到登录页
    if (!user) {
      router.push('/login')
      return
    }
    
    // 有用户时才获取宫殿数据
    fetchPalaces(user.id)
  }, [user, authLoading, mounted, router])

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
        showToast('📚 新图书馆已创建', 'success')
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
      title: '🗑️ 删除图书馆',
      message: '确定要删除这座图书馆吗？删除后无法恢复，所有书架和书籍也会被删除。',
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
            showToast('图书馆已删除', 'success')
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

  if (!mounted || authLoading) {
    return (
      <div className="tech-bg min-h-screen flex items-center justify-center">
        <div className="text-white/60 text-lg">加载中...</div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>我的图书馆 - 记忆宫殿</title>
        <meta name="description" content="管理你的知识图书馆" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </Head>

      <div className="tech-bg min-h-screen p-4 sm:p-8 relative">
        {/* 头部 */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
                ← 返回首页
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
                  onClick={logout}
                  className="text-white/60 hover:text-white text-sm transition-colors btn-press"
                >
                  退出
                </button>
              </div>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold text-white neon-glow mb-2">
                📚 我的图书馆
              </h1>
              <p className="text-white/50 text-sm">
                管理你的知识收藏
              </p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="ios-button flex items-center gap-2 btn-press"
            >
              <span>+</span>
              <span>新建图书馆</span>
            </button>
          </div>
        </div>

        {/* 图书馆书架展示区 */}
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="library-shelf">
              <SkeletonList count={3} />
            </div>
          ) : palaces.length === 0 ? (
            <div className="empty-shelf animate-fade-in-up" onClick={() => setShowModal(true)}>
              <div className="text-6xl mb-4">📚</div>
              <p className="text-xl font-semibold mb-2">还没有图书馆</p>
              <p className="text-white/50 text-sm mb-4">点击创建你的第一座知识图书馆</p>
              <button className="ios-button-secondary px-6 py-3 rounded-lg btn-press">
                + 创建图书馆
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* 图书馆标签 */}
              <div className="flex items-center gap-3 mb-4">
                <span className="tech-dot" />
                <span className="text-white/60 text-sm uppercase tracking-wider">
                  {palaces.length} 座图书馆
                </span>
              </div>

              {/* 图书馆网格 - 书架风格 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {palaces.map((palace, index) => (
                  <LibraryCard
                    key={palace.id}
                    palace={palace}
                    index={index}
                    onDelete={() => handleDeletePalace(palace.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 新建图书馆模态框 */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="glass-panel rounded-2xl p-6 sm:p-8 max-w-md w-full animate-scale-in border border-white/10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-white text-lg">
                  📚
                </div>
                <h2 className="text-2xl font-bold text-white">新建图书馆</h2>
              </div>
              
              <form onSubmit={handleCreatePalace}>
                <div className="mb-5">
                  <label className="block text-white/70 text-sm mb-2 font-medium">图书馆名称 *</label>
                  <input
                    type="text"
                    value={newPalaceName}
                    onChange={(e) => setNewPalaceName(e.target.value)}
                    className="w-full ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors"
                    placeholder="例如：英语学习图书馆"
                    autoFocus
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-white/70 text-sm mb-2 font-medium">描述</label>
                  <textarea
                    value={newPalaceDesc}
                    onChange={(e) => setNewPalaceDesc(e.target.value)}
                    className="w-full ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors resize-none"
                    placeholder="这个图书馆用来收藏什么知识？"
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

function LibraryCard({ palace, index, onDelete }) {
  return (
    <div 
      className="library-shelf animate-fade-in-up group"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* 书架顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent rounded-t-2xl" />
      
      <Link href={`/palace/${palace.id}/view3d`}>
        {/* 图书馆封面 */}
        <div className="mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-3xl mb-3 border border-white/10 group-hover:scale-110 transition-transform duration-300">
            📚
          </div>
          <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
            {palace.name}
          </h3>
          <p className="text-white/50 text-sm line-clamp-2">
            {palace.description || '暂无描述'}
          </p>
        </div>

        {/* 书架分隔线 */}
        <div className="tech-line my-4" />

        {/* 书架信息 */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="tech-dot" />
            <span className="text-white/60 text-sm">
              {palace.rooms?.length || 0} 个书架
            </span>
          </div>
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

        {/* 悬停光晕效果 */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </Link>
    </div>
  )
}

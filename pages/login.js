import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { login, getCurrentUser } from '../lib/auth'

export default function Login() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 检查是否已登录
    const user = getCurrentUser()
    if (user) {
      router.push('/palaces')
    }
  }, [router])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return

    setLoading(true)
    const user = login(name)
    console.log('登录成功:', user)
    
    // 延迟跳转，让用户看到反馈
    setTimeout(() => {
      router.push('/palaces')
    }, 500)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 rounded-xl p-8 max-w-md w-full border border-white/20 backdrop-blur-sm">
        <Head>
          <title>欢迎 - 记忆宫殿</title>
        </Head>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">🏰 记忆宫殿</h1>
          <p className="text-white/70">开始你的知识管理之旅</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white/80 text-sm mb-2">
              你的名字
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:border-white/50"
              placeholder="例如：张三"
              autoFocus
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full bg-white/20 hover:bg-white/30 disabled:bg-white/10 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-all backdrop-blur-sm border border-white/30"
          >
            {loading ? '进入中...' : '开始使用'}
          </button>
        </form>

        <p className="text-white/50 text-xs text-center mt-6">
          本地存储 · 隐私保护 · 无需注册
        </p>
      </div>
    </div>
  )
}

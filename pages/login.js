/**
 * 登录页面 - localStorage 临时方案
 * 无需 Supabase，输入名字即可登录
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { login } from '../lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    if (!name.trim()) {
      setError('请输入你的名字')
      setLoading(false)
      return
    }
    
    try {
      // 使用 localStorage 临时方案登录
      const user = login(name.trim())
      
      // 跳转到宫殿列表页
      router.push('/palaces')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <>
      <div className="tech-bg min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        {/* 扫描线效果 */}
        <div className="scan-line fixed top-0 left-0 right-0 pointer-events-none" />
        
        <div className="glass-panel rounded-2xl p-6 sm:p-8 w-full max-w-md border border-white/10 animate-scale-in">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-400/20 to-purple-500/20 flex items-center justify-center text-4xl mx-auto mb-4 border border-white/10 animate-pulse-glow">
              🏰
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 neon-glow">
              记忆宫殿
            </h1>
            <p className="text-white/60 text-sm">
              你的可视化知识管理系统
            </p>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl mb-6 text-sm animate-shake">
              ⚠️ {error}
            </div>
          )}

          {/* 登录表单 */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-white/70 text-sm mb-2 font-medium">
                你的名字
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full ios-card bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/50 transition-colors"
                placeholder="例如：张三"
                autoFocus
                disabled={loading}
              />
              <p className="text-white/50 text-xs mt-2">
                💡 输入名字即可开始使用（临时模式）
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full ios-button py-3 rounded-xl font-medium btn-press disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '加载中...' : '🚀 开始使用'}
            </button>
          </form>

          {/* 提示信息 */}
          <div className="mt-6 p-4 ios-card bg-white/5 rounded-xl">
            <p className="text-white/60 text-xs leading-relaxed">
              📝 <strong>临时模式说明：</strong><br/>
              当前使用本地存储模式，数据保存在浏览器中。<br/>
              后续可以接入 Supabase 实现云端同步。
            </p>
          </div>

          {/* 返回首页 */}
          <div className="mt-6 text-center">
            <Link href="/" className="text-white/60 hover:text-white text-sm transition-colors">
              ← 返回首页
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

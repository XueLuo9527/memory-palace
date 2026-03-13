/**
 * 登录/注册页面
 */

import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // 表单状态
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })
  
  // 更新表单
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError(null)
  }
  
  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup'
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData
      
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      const result = await res.json()
      
      if (!res.ok) {
        throw new Error(result.error?.message || '操作失败')
      }
      
      // 保存会话信息
      if (result.data?.session) {
        localStorage.setItem('memory-palace-session', JSON.stringify(result.data.session))
        localStorage.setItem('memory-palace-user', JSON.stringify(result.data.user))
      }
      
      // 跳转到首页
      router.push('/palaces')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 neon-text">
            🏰 记忆宫殿
          </h1>
          <p className="text-white/70">
            {isLogin ? '欢迎回来' : '创建你的账户'}
          </p>
        </div>
        
        {/* 错误提示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}
        
        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 用户名（仅注册） */}
          {!isLogin && (
            <div>
              <label className="block text-white/80 text-sm mb-2">用户名</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="请输入用户名"
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                required={!isLogin}
              />
            </div>
          )}
          
          {/* 邮箱 */}
          <div>
            <label className="block text-white/80 text-sm mb-2">邮箱</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="请输入邮箱"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
            />
          </div>
          
          {/* 密码 */}
          <div>
            <label className="block text-white/80 text-sm mb-2">密码</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="请输入密码"
              className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              required
              minLength={6}
            />
          </div>
          
          {/* 提交按钮 */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </span>
            ) : (
              isLogin ? '登录' : '注册'
            )}
          </button>
        </form>
        
        {/* 切换登录/注册 */}
        <div className="mt-6 text-center">
          <p className="text-white/70 text-sm">
            {isLogin ? '还没有账户？' : '已有账户？'}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setError(null)
              }}
              className="ml-2 text-purple-300 hover:text-purple-200 underline transition-colors"
            >
              {isLogin ? '立即注册' : '去登录'}
            </button>
          </p>
        </div>
        
        {/* 返回首页 */}
        <div className="mt-4 text-center">
          <Link href="/" className="text-white/50 hover:text-white/80 text-sm transition-colors">
            ← 返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
